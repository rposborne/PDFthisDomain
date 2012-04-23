class Order
  include DataMapper::Resource

  property :id,         Serial
  property :tx_id, Text
  property :status,       String
  property :urls,       Text
  property :options,       Text
  property :ip, String
  property :email, String
  property :raw, Text
  property :created_at, DateTime
  property :updated_at, DateTime

end
