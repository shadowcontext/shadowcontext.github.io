#!/usr/bin/env ruby
# frozen_string_literal: true

require "date"
require "yaml"
require "uri"

abort "usage: validate_post.rb REPOSITORY POST" unless ARGV.length == 2

repository = File.expand_path(ARGV[0])
post_path = File.expand_path(ARGV[1], repository)
raw = File.read(post_path, encoding: "UTF-8")
match = raw.match(/\A---\s*\n(.*?)\n---\s*\n(.*)\z/m)
abort "invalid or missing front matter" unless match

data = YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: false)
abort "front matter must be a mapping" unless data.is_a?(Hash)

required = %w[
  title subtitle description date layout category tags author read_time importance
  image image_alt key_points sources
]
missing = required.reject { |key| data.key?(key) }
abort "missing front matter: #{missing.join(', ')}" unless missing.empty?

def require_string(data, key, maximum: nil)
  value = data[key]
  abort "#{key} must be a non-empty string" unless value.is_a?(String) && !value.strip.empty?
  abort "#{key} exceeds #{maximum} characters" if maximum && value.length > maximum
end

%w[subtitle author read_time image image_alt].each { |key| require_string(data, key) }
require_string(data, "title", maximum: 85)
require_string(data, "description", maximum: 180)

abort "layout must be post" unless data["layout"] == "post"
abort "unsupported category" unless %w[ai-security threat-intelligence defense].include?(data["category"])
abort "unsupported importance" unless %w[routine notable urgent].include?(data["importance"])
abort "author must be ShadowContext Research" unless data["author"] == "ShadowContext Research"

tags = data["tags"]
abort "tags must contain three to five unique strings" unless tags.is_a?(Array) &&
  (3..5).cover?(tags.length) && tags.all? { |tag| tag.is_a?(String) && !tag.strip.empty? } && tags.uniq.length == tags.length

points = data["key_points"]
abort "key_points must contain exactly three strings" unless points.is_a?(Array) && points.length == 3 &&
  points.all? { |point| point.is_a?(String) && !point.strip.empty? }

sources = data["sources"]
abort "sources must contain one to four entries" unless sources.is_a?(Array) && (1..4).cover?(sources.length)
source_urls = sources.map do |source|
  abort "each source needs title, publisher, and url" unless source.is_a?(Hash) &&
    %w[title publisher url].all? { |key| source[key].is_a?(String) && !source[key].strip.empty? }
  uri = URI.parse(source["url"])
  abort "source URL must use HTTPS" unless uri.is_a?(URI::HTTPS) && uri.host
  source["url"]
rescue URI::InvalidURIError
  abort "invalid source URL"
end
abort "source URLs must be unique" unless source_urls.uniq.length == source_urls.length

published_at = data["date"]
abort "date must include a valid timestamp" unless published_at.respond_to?(:strftime)
filename_date = File.basename(post_path)[0, 10]
abort "filename and publication dates differ" unless published_at.strftime("%Y-%m-%d") == filename_date

image_path = File.join(repository, data["image"].sub(%r{\A/}, ""))
abort "selected image does not exist" unless File.file?(image_path)

body = match[2]
heading_count = body.scan(/^## [^#].+$/).length
abort "article must contain three or four level-two sections" unless (3..4).cover?(heading_count)
word_count = body.scan(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/).length
abort "article body must contain 550 to 850 words (found #{word_count})" unless (550..850).cover?(word_count)

puts "validated #{File.basename(post_path)}: #{word_count} words, #{sources.length} sources"
