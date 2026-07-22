#!/usr/bin/env ruby
# frozen_string_literal: true

require "cgi"
require "date"
require "json"
require "rexml/document"
require "set"
require "uri"
require "yaml"

abort "usage: validate_seo.rb REPOSITORY BUILD_DIRECTORY" unless ARGV.length == 2

repository = File.expand_path(ARGV[0])
build_directory = File.expand_path(ARGV[1], repository)
site_url = "https://shadowcontext.com"
errors = []

def front_matter(path)
  raw = File.read(path, encoding: "UTF-8")
  match = raw.match(/\A---\s*\n(.*?)\n---/m)
  return {} unless match

  YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: false) || {}
end

def page_file(build_directory, absolute_url)
  path = URI(absolute_url).path
  relative = if path == "/"
    "index.html"
  elsif path.end_with?("/")
    File.join(path.sub(%r{\A/}, ""), "index.html")
  else
    path.sub(%r{\A/}, "")
  end
  File.join(build_directory, relative)
end

def capture(html, pattern)
  match = html.match(pattern)
  match && CGI.unescapeHTML(match[1].strip)
end

def local_target(build_directory, href)
  path = href.split(/[?#]/, 2).first
  return nil if path.nil? || path.empty? || !path.start_with?("/")

  decoded = URI::DEFAULT_PARSER.unescape(path)
  relative = if decoded == "/"
    "index.html"
  elsif decoded.end_with?("/")
    File.join(decoded.sub(%r{\A/}, ""), "index.html")
  else
    decoded.sub(%r{\A/}, "")
  end
  File.join(build_directory, relative)
rescue ArgumentError
  nil
end

sitemap_path = File.join(build_directory, "sitemap.xml")
abort "missing built sitemap" unless File.file?(sitemap_path)

begin
  sitemap = REXML::Document.new(File.read(sitemap_path, encoding: "UTF-8"))
  sitemap_urls = REXML::XPath.match(sitemap, "//*[local-name()='loc']").map { |node| node.text.to_s.strip }
rescue REXML::ParseException => e
  abort "invalid sitemap XML: #{e.message}"
end

errors << "sitemap contains duplicate URLs" unless sitemap_urls.uniq.length == sitemap_urls.length
errors << "sitemap is empty" if sitemap_urls.empty?
sitemap_urls.each do |url|
  uri = URI.parse(url)
  errors << "sitemap URL is outside #{site_url}: #{url}" unless uri.is_a?(URI::HTTPS) && "#{uri.scheme}://#{uri.host}" == site_url
rescue URI::InvalidURIError
  errors << "invalid sitemap URL: #{url}"
end

core_paths = %w[
  / /about/ /contact/ /privacypolicy/ /disclaimer/ /tags/
  /category/ai-security/ /category/threat-intelligence/ /category/defense/
]
post_files = Dir[File.join(repository, "_posts", "*.md")].sort
post_records = post_files.map do |path|
  data = front_matter(path)
  slug = File.basename(path, ".md").sub(/\A\d{4}-\d{2}-\d{2}-/, "")
  [path, data, "/#{slug}/"]
end

expected_urls = (core_paths + post_records.map(&:last)).map { |path| "#{site_url}#{path}" }.to_set
actual_urls = sitemap_urls.to_set
(expected_urls - actual_urls).sort.each { |url| errors << "sitemap is missing #{url}" }
(actual_urls - expected_urls).sort.each { |url| errors << "sitemap contains non-indexable or unexpected URL #{url}" }

titles = Hash.new { |hash, key| hash[key] = [] }
descriptions = Hash.new { |hash, key| hash[key] = [] }

sitemap_urls.each do |url|
  path = page_file(build_directory, url)
  unless File.file?(path)
    errors << "sitemap URL has no built page: #{url}"
    next
  end

  html = File.read(path, encoding: "UTF-8")
  title = capture(html, %r{<title>(.*?)</title>}mi)
  description = capture(html, %r{<meta\s+name=["']description["']\s+content=["'](.*?)["']\s*/?>}mi)
  canonical = capture(html, %r{<link\s+rel=["']canonical["']\s+href=["'](.*?)["']\s*/?>}mi)
  robots = capture(html, %r{<meta\s+name=["']robots["']\s+content=["'](.*?)["']\s*/?>}mi)
  h1_count = html.scan(%r{<h1(?:\s[^>]*)?>.*?</h1>}mi).length

  errors << "missing title: #{url}" if title.nil? || title.empty?
  errors << "title is excessively long: #{url}" if title && title.length > 100
  errors << "missing meta description: #{url}" if description.nil? || description.empty?
  errors << "meta description exceeds 180 characters: #{url}" if description && description.length > 180
  errors << "canonical mismatch for #{url}: #{canonical.inspect}" unless canonical == url
  errors << "indexable sitemap URL is marked noindex: #{url}" if robots.to_s.downcase.include?("noindex")
  errors << "expected exactly one h1 on #{url}, found #{h1_count}" unless h1_count == 1
  titles[title] << url if title && !title.empty?
  descriptions[description] << url if description && !description.empty?

  json_blocks = html.scan(%r{<script\s+type=["']application/ld\+json["']>(.*?)</script>}mi).flatten
  errors << "missing JSON-LD: #{url}" if json_blocks.empty?
  json_blocks.each do |block|
    JSON.parse(block)
  rescue JSON::ParserError => e
    errors << "invalid JSON-LD on #{url}: #{e.message}"
  end

  html.scan(/href=["']([^"']+)["']/i).flatten.each do |href|
    next if href.start_with?("#", "mailto:", "tel:", "javascript:", "http://", "https://", "//")

    target = local_target(build_directory, href)
    errors << "malformed internal link on #{url}: #{href}" if target.nil? && href.start_with?("/")
    errors << "broken internal link on #{url}: #{href}" if target && !File.exist?(target)
  end
end

titles.each { |title, urls| errors << "duplicate title #{title.inspect}: #{urls.join(', ')}" if urls.length > 1 }
descriptions.each { |description, urls| errors << "duplicate meta description #{description.inspect}: #{urls.join(', ')}" if urls.length > 1 }

images = Hash.new { |hash, key| hash[key] = [] }
post_records.each do |path, data, route|
  %w[title description image image_alt].each do |key|
    value = data[key]
    errors << "#{File.basename(path)} has no #{key}" unless value.is_a?(String) && !value.strip.empty?
  end
  errors << "#{File.basename(path)} description exceeds 180 characters" if data["description"].to_s.length > 180
  image = data["image"]
  next unless image.is_a?(String) && image.start_with?("/")

  images[image] << File.basename(path)
  errors << "missing post image #{image}" unless File.file?(File.join(repository, image.sub(%r{\A/}, "")))
  errors << "missing built post route #{route}" unless File.file?(File.join(build_directory, route.sub(%r{\A/}, ""), "index.html"))
end
images.each { |image, posts| errors << "post image reused by #{posts.join(', ')}: #{image}" if posts.length > 1 }

robots_path = File.join(build_directory, "robots.txt")
if File.file?(robots_path)
  robots = File.read(robots_path, encoding: "UTF-8")
  errors << "robots.txt does not name the canonical sitemap" unless robots.match?(/^Sitemap:\s+#{Regexp.escape(site_url)}\/sitemap\.xml\s*$/i)
else
  errors << "missing robots.txt"
end

feed_path = File.join(build_directory, "feed.xml")
begin
  REXML::Document.new(File.read(feed_path, encoding: "UTF-8"))
rescue Errno::ENOENT
  errors << "missing feed.xml"
rescue REXML::ParseException => e
  errors << "invalid feed XML: #{e.message}"
end

admin_path = File.join(build_directory, "admin", "index.html")
if File.file?(admin_path)
  admin = File.read(admin_path, encoding: "UTF-8")
  errors << "admin page must be noindex" unless admin.match?(%r{<meta\s+name=["']robots["']\s+content=["'][^"']*noindex}i)
end

noindex_paths = %w[404.html staff/index.html contact/message-sent/index.html]
legacy_categories = Dir[File.join(repository, "category", "*.md")].filter_map do |path|
  data = front_matter(path)
  slug = data["slug"]
  next if %w[ai-security threat-intelligence defense].include?(slug)

  File.join("category", slug.to_s, "index.html")
end
(noindex_paths + legacy_categories).each do |relative|
  path = File.join(build_directory, relative)
  next unless File.file?(path)

  html = File.read(path, encoding: "UTF-8")
  errors << "utility or thin page must be noindex: /#{relative}" unless html.match?(%r{<meta\s+name=["']robots["']\s+content=["'][^"']*noindex}i)
end

unless errors.empty?
  warn errors.map { |error| "SEO validation: #{error}" }.join("\n")
  abort "SEO validation failed with #{errors.length} issue#{errors.length == 1 ? '' : 's'}"
end

puts "SEO validation passed: #{sitemap_urls.length} indexable URLs, #{post_records.length} posts, #{images.length} unique post images"
