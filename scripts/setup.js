import _0x324b27 from 'fs';
import _0x48497d from 'path';
async function fileExists(_0x4e9692) {
  try {
    await _0x324b27.promises.access(_0x4e9692);
    return true;
  } catch {
    return false;
  }
}
async function copyFile(_0x4d07e1, _0x16cd4f) {
  try {
    if (await fileExists(_0x16cd4f)) {
      console.log("File already exists at " + _0x16cd4f + ", skipping copy.");
    } else {
      await _0x324b27.promises.copyFile(_0x4d07e1, _0x16cd4f);
      console.log("Copied " + _0x4d07e1 + " to " + _0x16cd4f);
    }
  } catch (_0x215112) {
    console.error("Error copying file from " + _0x4d07e1 + " to " + _0x16cd4f + ':', _0x215112);
  }
}
const copyOperations = [{
  'src': _0x48497d.join('config', "config_tmp.js"),
  'dest': _0x48497d.join("config", 'config.js')
}, {
  'src': _0x48497d.join('config', "proxy_list_tmp.js"),
  'dest': _0x48497d.join("config", "proxy_list.js")
}];
(async () => {
  console.log("Copying Template File");
  for (let {
    src: _0x142cf4,
    dest: _0x3dc042
  } of copyOperations) {
    await copyFile(_0x142cf4, _0x3dc042);
  }
  console.log("\nSetup Complete");
  console.log("Open and configure\n- config/config.js\n- config/proxy_list.js\n ");
})();
