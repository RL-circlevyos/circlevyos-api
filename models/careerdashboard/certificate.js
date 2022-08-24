const { model, Schema } = require("mongoose");

const CertificateSchema = new Schema({
  jobprofile: {
    type: Schema.ObjectId,
    ref: "jobprofile",
  },
  certificatename: {
    type: String,
  },
  document: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = model("certificate", CertificateSchema);
