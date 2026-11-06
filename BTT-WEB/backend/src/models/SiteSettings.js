import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    companyName: { type: String, default: 'BlackTuf Technologies', maxlength: 120 },
    brandName: { type: String, default: 'BlackTuf', maxlength: 60 },
    tagline: { type: String, default: 'Building Technology That Moves Ideas Forward.', maxlength: 200 },
    description: {
      type: String,
      default:
        'Building modern software products, digital platforms, and technology solutions.',
      maxlength: 400,
    },
    supportHandle: { type: String, default: '@blacktuftech', maxlength: 80 },
    supportUrl: { type: String, default: '', maxlength: 500 },
    socialWebsite: { type: String, default: '', maxlength: 500 },
    socialGithub: { type: String, default: '', maxlength: 500 },
    socialLinkedin: { type: String, default: '', maxlength: 500 },
    business: {
      showBusinessInfo: { type: Boolean, default: true },
      enterpriseName: { type: String, default: 'BlackTuf Technologies', maxlength: 160 },
      businessType: { type: String, default: 'Micro Enterprise', maxlength: 80 },
      majorActivity: { type: String, default: 'Services', maxlength: 80 },
      industry: {
        type: String,
        default: 'Computer Programming / Consultancy Related Activities',
        maxlength: 200,
      },
      registrationNote: {
        type: String,
        default: "Official business information is based on the company's Udyam registration.",
        maxlength: 300,
      },
    },
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
