// legacy-pages/api/get-address.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Missing lat or lng" });
  }

  try {
    const response = await fetch(`https://api.neshan.org/v5/reverse?lat=${lat}&lng=${lng}`, {
      headers: {
        "Api-Key": "service.c6d687920283496f80d2e7a02dccfa33",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: "Neshan API Error" });
    }

    const data = await response.json();
    return res.status(200).json({ address: data.formatted_address });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
}
