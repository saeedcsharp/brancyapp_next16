export default function MessageTockenGenerator() {
  var timestamp = Date.now();
  var epoch = BigInt(timestamp) << BigInt(22);
  var otid = epoch + BigInt(Math.floor(Math.random() * 4194304));
  return otid.toString();
}
