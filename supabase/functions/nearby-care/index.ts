// Finds hospitals, clinics, doctors, pharmacies and dentists near a coordinate
// using the Google Maps Places API (New) through the Lovable connector gateway.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

const KIND_TYPES: Record<string, string[]> = {
  hospital: ["hospital"],
  doctor: ["doctor"],
  pharmacy: ["pharmacy"],
  dentist: ["dentist"],
  emergency: ["hospital", "emergency_room"],
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireUser(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !data?.user) return json({ error: "Unauthorized" }, 401);
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const unauthorized = await requireUser(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json().catch(() => null);
    let lat = Number(body?.lat);
    let lng = Number(body?.lng);
    const addressQuery = typeof body?.address === "string" ? body.address.trim().slice(0, 200) : "";
    const kind = typeof body?.kind === "string" ? body.kind : "hospital";
    const radius = Math.min(Math.max(Number(body?.radius) || 5000, 500), 50000);

    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
    if (!hasCoords && addressQuery.length < 3) {
      return json({ error: "Provide coordinates or an address" }, 400);
    }
    if (hasCoords && (!Number.isFinite(lat) || lat < -90 || lat > 90 || lng < -180 || lng > 180)) {
      return json({ error: "Valid lat and lng are required" }, 400);
    }
    const includedTypes = KIND_TYPES[kind];
    if (!includedTypes) return json({ error: `Unsupported kind: ${kind}` }, 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      return json({ error: "Maps connector is not configured for this project yet." }, 503);
    }

    const gatewayHeaders = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
    };

    if (!hasCoords) {
      const geo = await fetch(
        `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(addressQuery)}`,
        { headers: gatewayHeaders },
      );
      if (!geo.ok) {
        const detail = await geo.text();
        console.error(`Geocode failed [${geo.status}]: ${detail}`);
        return json({ error: "Could not look up that place", status: geo.status, details: detail }, geo.status);
      }
      const geoData = await geo.json();
      const loc = geoData?.results?.[0]?.geometry?.location;
      if (!loc) return json({ error: "No location matched that address" }, 404);
      lat = Number(loc.lat);
      lng = Number(loc.lng);
    }

    const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchNearby`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.rating",
          "places.userRatingCount",
          "places.nationalPhoneNumber",
          "places.internationalPhoneNumber",
          "places.googleMapsUri",
          "places.primaryTypeDisplayName",
          "places.currentOpeningHours.openNow",
        ].join(","),
      },
      body: JSON.stringify({
        includedTypes,
        maxResultCount: 20,
        rankPreference: "DISTANCE",
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error(`Places searchNearby failed [${res.status}]: ${detail}`);
      if (res.status === 403) {
        return json(
          {
            error:
              "Google denied the request (403). The Maps server key needs application restrictions set to \"None\" or \"IP addresses\", and the Places API (New) must be in its allowed-APIs list.",
            status: 403,
            details: detail,
          },
          403,
        );
      }
      return json({ error: "Places request failed", status: res.status, details: detail }, res.status);
    }

    const data = await res.json();
    const toRad = (d: number) => (d * Math.PI) / 180;
    const places = (data?.places ?? []).map((p: Record<string, any>) => {
      const plat = p?.location?.latitude;
      const plng = p?.location?.longitude;
      let distanceKm: number | null = null;
      if (Number.isFinite(plat) && Number.isFinite(plng)) {
        const dLat = toRad(plat - lat);
        const dLng = toRad(plng - lng);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat)) * Math.cos(toRad(plat)) * Math.sin(dLng / 2) ** 2;
        distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }
      return {
        id: p?.id,
        name: p?.displayName?.text ?? "Unnamed",
        address: p?.formattedAddress ?? "",
        category: p?.primaryTypeDisplayName?.text ?? "",
        rating: p?.rating ?? null,
        reviews: p?.userRatingCount ?? null,
        phone: p?.nationalPhoneNumber ?? p?.internationalPhoneNumber ?? null,
        openNow: p?.currentOpeningHours?.openNow ?? null,
        mapsUri: p?.googleMapsUri ?? null,
        lat: plat ?? null,
        lng: plng ?? null,
        distanceKm: distanceKm === null ? null : Math.round(distanceKm * 10) / 10,
      };
    });

    return json({ kind, radius, center: { lat, lng }, count: places.length, places });
  } catch (e) {
    console.error("nearby-care error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
