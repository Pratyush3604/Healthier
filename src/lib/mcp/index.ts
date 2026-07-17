import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import updateProfileTool from "./tools/update-profile";
import healthInfoTool from "./tools/health-info";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "healthier-mcp",
  title: "Healthier",
  version: "0.1.0",
  instructions:
    "Healthier is an AI health assistant. Tools let the signed-in user read/update their profile and ask general (non-emergency) health questions. Never provide diagnoses, prescriptions, or emergency medical advice — direct users to professional care for anything serious.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, updateProfileTool, healthInfoTool],
});
