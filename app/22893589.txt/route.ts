export const dynamic = "force-static";

const fileName = "22893589.txt";
const fileContent = "";

export async function GET() {
  return new Response(fileContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
