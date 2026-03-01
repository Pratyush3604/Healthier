import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("Image data is required");
    }

    let systemPrompt = "";
    
    if (type === "injury") {
      systemPrompt = `You are an AI medical assistant specializing in injury assessment. Analyze this image and provide:

1. **Injury Type**: What type of injury is visible (cut, burn, bruise, scrape, etc.)
2. **Severity Assessment**: Rate as MILD, MODERATE, or SEVERE
3. **Visible Characteristics**: Describe what you observe
4. **First Aid Recommendations**: Step-by-step home care instructions
5. **Warning Signs**: Symptoms that would require immediate medical attention
6. **When to Seek Care**: Clear guidance on when to see a doctor

CRITICAL: For any injury that appears severe (deep cuts, large burns, potential fractures, heavy bleeding), immediately recommend professional medical care.

Keep response structured and easy to follow. Use bullet points where appropriate.`;
    } else if (type === "report") {
      systemPrompt = `You are an AI medical assistant specializing in medical report interpretation. Analyze this medical report/scan image and provide:

1. **Report Type**: Identify what kind of report/scan this is
2. **Key Findings**: Summarize the main observations
3. **Notable Values**: Highlight any values outside normal ranges
4. **Plain Language Explanation**: Explain findings in simple terms
5. **Recommended Follow-up**: Suggest next steps if any
6. **Questions for Doctor**: Suggest questions to ask their healthcare provider

CRITICAL: Always recommend discussing results with a qualified healthcare provider. You are providing educational context only.

Keep the response clear and accessible to non-medical readers.`;
    } else if (type === "skin") {
      systemPrompt = `You are an AI dermatology assistant. Analyze this skin image and provide:

1. **Possible Condition**: What the skin condition might be
2. **Characteristics**: Describe visible features (color, texture, size, location)
3. **Common Causes**: What typically causes this type of condition
4. **Home Care**: Safe home remedies and care suggestions
5. **When to See a Dermatologist**: Warning signs that need professional evaluation

CRITICAL: Always recommend consulting a dermatologist for proper diagnosis. You are providing educational context only. If the condition looks potentially serious (irregular moles, rapidly changing lesions, signs of infection), strongly recommend immediate professional evaluation.`;
    } else {
      systemPrompt = `You are an AI medical assistant. Analyze this health-related image and provide helpful, educational information. Always recommend consulting healthcare professionals for proper diagnosis and treatment.`;
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
