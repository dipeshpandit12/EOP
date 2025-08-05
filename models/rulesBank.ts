import { Schema, model, models } from "mongoose";

const ruleListSchema = new Schema({
  rule: { type: String, required: true },
  // Add more fields as needed for each rule (e.g., severity, type, etc.)
}, { _id: false });

const rulesBankSchema = new Schema({
  information: { type: [ruleListSchema], default: [] },
  assessment: { type: [ruleListSchema], default: [] },
  responsePlan: { type: [ruleListSchema], default: [] },
  review: { type: [ruleListSchema], default: [] },
}, { timestamps: true });

const RulesBankModel = models.RulesBank || model("RulesBank", rulesBankSchema);

export default RulesBankModel;

// Demo rules for each section
export const demoRulesBank = {
  information: [
    { rule: "Are you requesting a Major Disaster declaration or an Emergency declaration for this event?" },
    { rule: "What type of disaster occurred, and what dates did the incident happen?" },
    { rule: "Which specific tribal lands or areas were affected by the disaster?" },
    { rule: "Were there any fatalities, injuries, or missing persons as a result of the event?" },
    { rule: "Has the Tribal Chief Executive declared a state of emergency? If yes, when and for what areas?" },
    { rule: "Was the Tribal Emergency Plan activated in response to this disaster?" },
  ],
  assessment: [
    { rule: "Risk assessment must be conducted annually." },
    { rule: "All identified risks should be documented." },
    { rule: "Assessment results must be reviewed by management." }
  ],
  responsePlan: [
    { rule: "A written emergency response plan is required." },
    { rule: "Plan must be updated after every major incident." },
    { rule: "All staff must be trained on the response plan." }
  ],
  review: [
    { rule: "Plans and assessments must be reviewed every 6 months." },
    { rule: "Review findings should be documented and shared." }
  ]
};
