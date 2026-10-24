import test from "node:test";
import assert from "node:assert/strict";
import { savedStatusMessage, syncNoticeMessage } from "./syncStatusCopy.ts";

test("saved status explains device and account locations in plain language", () => {
  assert.equal(savedStatusMessage("local", "Rencana"), "Rencana tersimpan di perangkat.");
  assert.equal(savedStatusMessage("queued", "Rencana"), "Rencana tersimpan di perangkat, belum masuk ke akun.");
  assert.equal(savedStatusMessage("failed", "Rencana"), "Rencana tersimpan di perangkat. Belum berhasil dikirim ke akun.");
  assert.equal(savedStatusMessage("synced", "Rencana"), "Rencana tersimpan di perangkat dan akun.");
});

test("offline queue notice says data stays on device until internet returns", () => {
  assert.equal(
    syncNoticeMessage(2, false, false),
    "Ada 2 data yang belum masuk ke akun. Data tetap ada di perangkat dan akan dikirim saat internet tersedia.",
  );
});

test("failed sync notice gives a clear retry action without implying data loss", () => {
  assert.equal(
    syncNoticeMessage(1, true, true),
    "Data belum berhasil dikirim ke akun. Data masih tersimpan di perangkat. Periksa internet, lalu coba lagi.",
  );
});
