import { markdownIdentity, markdownRegistry } from '../../../lib/markdown-registry';
export function getStaticPaths() {
  return ['_catalog', '_identity'].map((document) => ({ params: { document } }));
}
export async function GET({ params }: { params: { document: string } }) {
  if (params.document === '_catalog') {
    return (await markdownRegistry()).handler(new Request(`${markdownIdentity.url}/api/md/_catalog`));
  }
  const data = markdownIdentity;
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
