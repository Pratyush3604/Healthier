import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { guard } from "../_shared/guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const gate = await guard(req, "analyze-image", corsHeaders);
  if ("denied" in gate) return gate.denied;

  try {
    const { imageBase64, type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("Image data is required");
    }

    const safetyRule = `\n\nCRITICAL SAFETY RULES:
- Do NOT prescribe any medications or specific drugs.
- Do NOT diagnose serious conditions definitively.
- For anything potentially serious, clearly state: "Please consult a qualified healthcare provider."
- Do NOT recommend prescription treatments.
- Always use the name "Healthier" when referring to this service.`;

    let systemPrompt = "";
    
    if (type === "injury") {
      systemPrompt = `You are an AI medical assistant specializing in injury assessment. Analyze this image.
${context ? `Context: ${context}` : ''}

Start with empathy (acknowledge their concern), then provide EXACTLY these sections:

## Possible Conditions
What type of injury is visible and possible conditions.

## Urgency Level
Rate as Emergency / Urgent / Non-urgent / Self-care with explanation.

## Recommended Actions
Step-by-step home care and first aid instructions. Include safe home remedies. Do NOT prescribe medications.

## When to Seek Professional Care
Warning signs that require immediate medical attention.

## Possible Causes
What might have caused this type of injury.${safetyRule}`;
    } else if (type === "report") {
      systemPrompt = `You are an AI medical assistant specializing in medical report interpretation. Analyze this report/scan image.

1. **Report Type**: What kind of report/scan
2. **Key Findings**: Main observations
3. **Notable Values**: Values outside normal ranges
4. **Plain Language Explanation**: Simple terms
5. **Recommended Follow-up**: Next steps
6. **Questions for Doctor**: Suggested questions

CRITICAL: Always recommend discussing results with a qualified healthcare provider. Use "Healthier" as the service name.${safetyRule}`;
    } else if (type === "skin") {
      systemPrompt = `You are an AI dermatology assistant. Analyze this skin image.
${context ? `Context: ${context}` : ''}

Start with empathy, then provide EXACTLY these sections:

## Possible Conditions
What the skin condition might be based on visible features.

## Urgency Level
Rate as Emergency / Urgent / Non-urgent / Self-care with explanation.

## Recommended Actions
Safe home remedies and skincare suggestions. Do NOT prescribe medications.

## When to Seek Professional Care
Warning signs that need a dermatologist visit.

## Possible Causes
What typically causes this type of condition.${safetyRule}`;
    } else {
      systemPrompt = `You are an AI medical assistant. Analyze this health-related image and provide helpful, educational information. Always recommend consulting healthcare professionals. Use "Healthier" as the service name.${safetyRule}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Please analyze this image and provide your assessment." },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Vision API error:", response.status, errorText);
      throw new Error(`Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Unable to analyze image";

    return new Response(JSON.stringify({ 
      analysis,
      type,
      timestamp: new Date().toISOString(),
      disclaimer: "This is an AI-generated preliminary assessment. Always consult qualified healthcare professionals for proper diagnosis and treatment."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
