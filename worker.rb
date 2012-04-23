require 'resque'
require 'uri'
require 'zip/zip'
require 'pony'
require 'fog'
require 'shellwords'
require 'active_support/core_ext/class/attribute_accessors'
require 'active_support/core_ext/object/blank'
require 'net/http'
require 'bitly'

ENV['APP_ROOT'] ||= File.dirname(__FILE__)

=begin
Worker Code

All PDF rendering and file generation happens in Memory. (Money Saving)

=end

uri = URI.parse(ENV["REDISTOGO_URL"])
Resque.redis = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)

class Pdfs
  @queue = :low
  def self.perform(job)
    id             = job["id"]
    email          = job["email"]
    url            = job["url"]
    processed_urls = job["urls_to_process"]
    options        = job["options"]
    name           = "#{email}_#{Time.now}.zip"

    t = Tempfile.new(name)
    temp_files = []
    processed_urls.uniq.each_with_index do |link, i|
      puts "Rendering Link #{link}"
      temp_files << {:file => render_url_to_pdf(link,options) ,:name => URI(link.dup).path.gsub!('/','_').to_s }
    end
    Zip::ZipOutputStream.open(t.path) do |z|
      temp_files.each do |file|
        title = file[:name]
        title += ".pdf" unless title.end_with?(".pdf")
        z.put_next_entry(title)
        z.print file[:file].read
      end
    end

    storage = Fog::Storage.new(
      :provider                 => 'AWS',
      :aws_secret_access_key    => ENV["S3_SECRET"],
      :aws_access_key_id        => ENV["S3_KEY"]  
    )
    directory = storage.directories.get("pdfthisdomain")
    object = directory.files.create(
    :key    => name,
    :body   => t.read,
    :public => true
    )
    puts "Upload to S3 #{object.public_url} with attachment size of #{t.size}"
    puts "sending mail with attachment size of #{object.public_url}"
    
    Pony.mail({ :to => email,
      :from => 'pdfthisdomain@burningpony.com',
      :subject => 'The PDFs you requested!', 
      :headers => { 'Content-Type' => 'text/html' },
      :body => "<h1>Howdy!</h1> <br /> Your PDF can be found <a href =\"#{object.public_url}\"> Here</a>.<br \> <strong>They will only be avaliable for the next 24 hours.</strong><br \> <br \> Thanks, <br \> Russell",
      :via => :smtp,
      :via_options => {
        :address              => 'smtp.gmail.com',
        :port                 => '587',
        :enable_starttls_auto => true,
        :user_name            => ENV["GMAIL_USER"],
        :password             => ENV["GMAIL_PASSWORD"],
        :authentication       => :plain, 
        :domain               => "pdfthisdomain.com"
      }
    })
    
    report_to_app_server({:id => id, :long_url => object.public_url , :short_url => "" , :status => "Complete"})
  end
end

def report_to_app_server(data)
  postData = Net::HTTP.post_form(URI.parse('http://pdfthisdomain.com/worker_endpoint'), data )  
  return postData
end

def render_url_to_pdf(url, options={})
  t = Tempfile.new("#{Time.now}")
  puts "Rendering Link #{url}  to #{t.path}"
  wk = File.join(ENV['APP_ROOT'], "bin", "wkhtmltopdf-amd64")
  command = "\"#{wk}\" -q #{url} #{Shellwords.escape(t.path)} #{parse_options(options)}"
  system("#{command}")
  
  return t
end

def parse_options(options)
  [
    parse_header_footer(:header => options.delete(:header),
                        :footer => options.delete(:footer),
                        :layout => options[:layout]),
    parse_toc(options.delete(:toc)),
    parse_outline(options.delete(:outline)),
    parse_margins(options.delete(:margin)),
    parse_others(options),
    parse_basic_auth(options)
  ].join(' ')
end

def parse_basic_auth(options)
  if options[:basic_auth]
    user, passwd = Base64.decode64(options[:basic_auth]).split(":")
    "--username '#{user}' --password '#{passwd}'"
  else
    ""
  end
end

def make_option(name, value, type=:string)
  if value.is_a?(Array)
    return value.collect { |v| make_option(name, v, type) }.join('')
  end
  "--#{name.gsub('_', '-')} " + case type
    when :boolean then ""
    when :numeric then value.to_s
    when :name_value then value.to_s
    else "\"#{value}\""
  end + " "
end

def make_options(options, names, prefix="", type=:string)
  names.collect {|o| make_option("#{prefix.blank? ? "" : prefix + "-"}#{o.to_s}", options[o], type) unless options[o].blank?}.join
end

def parse_header_footer(options)
  r=""
  [:header, :footer].collect do |hf|
    unless options[hf].blank?
      opt_hf = options[hf]
      r += make_options(opt_hf, [:center, :font_name, :left, :right], "#{hf.to_s}")
      r += make_options(opt_hf, [:font_size, :spacing], "#{hf.to_s}", :numeric)
      r += make_options(opt_hf, [:line], "#{hf.to_s}", :boolean)
      unless opt_hf[:html].blank?
        r += make_option("#{hf.to_s}-html", opt_hf[:html][:url]) unless opt_hf[:html][:url].blank?
      end
    end
  end unless options.blank?
  r
end

def parse_toc(options)
  r = '--toc ' unless options.nil?
  unless options.blank?
    r += make_options(options, [ :font_name, :header_text], "toc")
    r +=make_options(options, [ :depth,
                                :header_fs,
                                :l1_font_size,
                                :l2_font_size,
                                :l3_font_size,
                                :l4_font_size,
                                :l5_font_size,
                                :l6_font_size,
                                :l7_font_size,
                                :l1_indentation,
                                :l2_indentation,
                                :l3_indentation,
                                :l4_indentation,
                                :l5_indentation,
                                :l6_indentation,
                                :l7_indentation], "toc", :numeric)
    r +=make_options(options, [ :no_dots,
                                :disable_links,
                                :disable_back_links], "toc", :boolean)
  end
  return r
end

def parse_outline(options)
  unless options.blank?
    r = make_options(options, [:outline], "", :boolean)
    r +=make_options(options, [:outline_depth], "", :numeric)
  end
end

def parse_margins(options)
  make_options(options, [:top, :bottom, :left, :right], "margin", :numeric) unless options.blank?
end

def parse_others(options)
  unless options.blank?
    r = make_options(options, [ :orientation,
                                :page_size,
                                :page_width,
                                :page_height,
                                :proxy,
                                :username,
                                :password,
                                :cover,
                                :dpi,
                                :encoding,
                                :user_style_sheet])
    r +=make_options(options, [ :cookie,
                                :post], "", :name_value)
    r +=make_options(options, [ :redirect_delay,
                                :zoom,
                                :page_offset,
                                :javascript_delay], "", :numeric)
    r +=make_options(options, [ :book,
                                :default_header,
                                :disable_javascript,
                                :greyscale,
                                :lowquality,
                                :enable_plugins,
                                :disable_internal_links,
                                :disable_external_links,
                                :print_media_type,
                                :disable_smart_shrinking,
                                :use_xserver,
                                :no_background], "", :boolean)
  end
end