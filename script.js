
const $ = id => document.getElementById(id);

// Tanda tangan digital
const canvas = $("signature");
const ctx = canvas.getContext("2d");

let drawing = false;
let hasSignature = false;

ctx.strokeStyle = "#111";
ctx.lineWidth = 2;
ctx.lineCap = "round";
ctx.lineJoin = "round";

function getPosition(e) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (e.clientX - rect.left) * canvas.width / rect.width,
        y: (e.clientY - rect.top) * canvas.height / rect.height
    };
}

canvas.addEventListener("pointerdown", e => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);

    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener("pointermove", e => {
    if (!drawing) return;

    const pos = getPosition(e);

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    hasSignature = true;
    updateSignature();
});

canvas.addEventListener("pointerup", () => {
    drawing = false;
});

canvas.addEventListener("pointercancel", () => {
    drawing = false;
});

// Hapus tanda tangan
$("clearSignature").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature = false;
    $("signaturePreview").src = "";
});

// Tampilkan tanda tangan
function updateSignature() {
    $("signaturePreview").src =
        hasSignature ? canvas.toDataURL("image/png") : "";
}

// Menghubungkan input ke preview
const fields = {
    nama: "previewNama",
    ttl: "previewTTL",
    gender: "previewGender",
    pendidikan: "previewPendidikan",
    alamat: "previewAlamat",
    hp: "previewHP",
    email: "previewEmail",
    perusahaan: "previewPerusahaan",
    alamatPerusahaan: "previewAlamatPerusahaan",
    posisi: "previewPosisi",
    isi: "previewIsi"
};

Object.entries(fields).forEach(([inputId, previewId]) => {
    $(inputId).addEventListener("input", () => {
        $(previewId).textContent = $(inputId).value || "-";

        if (inputId === "nama") {
            $("previewNamaTTD").textContent =
                $(inputId).value || "Nama Pelamar";
        }
    });
});

// Tanggal surat
$("tanggal").valueAsDate = new Date();

function formatTanggal(value) {
    if (!value) return "-";

    const date = new Date(value + "T00:00:00");

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(date);
}

$("tanggal").addEventListener("input", () => {
    $("previewTanggal").textContent =
        "Jakarta, " + formatTanggal($("tanggal").value);
});

$("tanggal").dispatchEvent(new Event("input"));

// Upload foto
$("foto").addEventListener("change", e => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Silakan pilih file gambar.");
        e.target.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran foto maksimal 5 MB.");
        e.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = event => {
        $("previewFoto").src = event.target.result;
        $("previewFoto").hidden = false;
    };

    reader.readAsDataURL(file);
});

// Cetak / Simpan PDF
$("printBtn").addEventListener("click", () => {
    if (!$("nama").value.trim()) {
        alert("Silakan isi nama lengkap terlebih dahulu.");
        $("nama").focus();
        return;
    }

    window.print();
});

// Reset semua data
$("resetBtn").addEventListener("click", () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua data?")) {
        return;
    }

    $("letterForm").reset();

    Object.keys(fields).forEach(inputId => {
        $(fields[inputId]).textContent = "-";
    });

    $("previewNamaTTD").textContent = "Nama Pelamar";
    $("previewTanggal").textContent = "Jakarta, -";

    $("previewFoto").src = "";
    $("previewFoto").hidden = true;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature = false;

    $("signaturePreview").src = "";

    $("tanggal").valueAsDate = new Date();
    $("tanggal").dispatchEvent(new Event("input"));
});
