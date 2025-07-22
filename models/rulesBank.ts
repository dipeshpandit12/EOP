import { Schema, model, models } from "mongoose";

const ruleListSchema = new Schema({
  rule: { type: String, required: true },
  // Add more fields as needed for each rule (e.g., severity, type, etc.)
}, { _id: false });

const rulesBankSchema = new Schema({
  information: { type: [ruleListSchema], default: [] },
  Assessment: { type: [ruleListSchema], default: [] },
  ResponsePlan: { type: [ruleListSchema], default: [] },
  Review: { type: [ruleListSchema], default: [] },
}, { timestamps: true });

const RulesBankModel = models.RulesBank || model("RulesBank", rulesBankSchema);

export default RulesBankModel;

// Demo rules for each section
export const demoRulesBank = {
  information: [
    { rule: "Organization name must be provided." },
    { rule: "Primary contact must have a valid email address." },
    { rule: "Facility address should be complete and up to date." }
  ],
  Assessment: [
    { rule: "Risk assessment must be conducted annually." },
    { rule: "All identified risks should be documented." },
    { rule: "Assessment results must be reviewed by management." }
  ],
  ResponsePlan: [
    { rule: "A written emergency response plan is required." },
    { rule: "Plan must be updated after every major incident." },
    { rule: "All staff must be trained on the response plan." }
  ],
  Review: [
    { rule: "Plans and assessments must be reviewed every 6 months." },
    { rule: "Review findings should be documented and shared." }
  ]
};
