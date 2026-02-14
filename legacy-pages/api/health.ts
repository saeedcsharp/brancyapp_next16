import type { NextApiRequest, NextApiResponse } from "next";

type HealthResponse = {
  status: string;
  timestamp: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  // Simple health check - returns 200 if the container is alive
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
