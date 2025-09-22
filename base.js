document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklist-form');
  const midiaInputGaleria = document.getElementById('midia');

  const canvas = document.getElementById('signature-pad');

  // 🔧 Ajusta o tamanho lógico do canvas para coincidir com o tamanho visual na tela
  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
  }

  resizeCanvas(); // ajusta ao carregar
  window.addEventListener("resize", resizeCanvas); // ajusta ao redimensionar a tela

  const signaturePad = new SignaturePad(canvas);
  const clearButton = document.getElementById('clear-signature');

  // ===== Viatura =====
  const abrirCamViatura = document.getElementById('abrir-camera-viatura');
  const cameraContainerViatura = document.getElementById('camera-container-viatura');
  const videoViatura = document.getElementById('camera-viatura');
  const btnFotoViatura = document.getElementById('tirar-foto-viatura');
  const btnFecharViatura = document.getElementById('fechar-camera-viatura');
  const previewsViatura = document.getElementById('previews-viatura');
  let streamViatura;
  let fotosViatura = [];

  abrirCamViatura.addEventListener('click', async () => {
    try {
      streamViatura = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      videoViatura.srcObject = streamViatura;
      cameraContainerViatura.style.display = "block";
    } catch (err) {
      alert("Erro ao abrir câmera: " + err.message);
    }
  });

  btnFotoViatura.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoViatura.videoWidth;
    canvas.height = videoViatura.videoHeight;
    canvas.getContext('2d').drawImage(videoViatura, 0, 0);
    canvas.toBlob(blob => {
      fotosViatura.push(blob);
      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
      previewsViatura.appendChild(img);
    }, 'image/jpeg');
  });

  btnFecharViatura.addEventListener('click', () => {
    if (streamViatura) streamViatura.getTracks().forEach(track => track.stop());
    cameraContainerViatura.style.display = "none";
  });

  // ===== Carteirinha =====
  const abrirCamCart = document.getElementById('abrir-camera-carteirinha');
  const cameraContainerCart = document.getElementById('camera-container-carteirinha');
  const videoCart = document.getElementById('camera-carteirinha');
  const btnFotoCart = document.getElementById('tirar-foto-carteirinha');
  const btnFecharCart = document.getElementById('fechar-camera-carteirinha');
  const previewsCart = document.getElementById('previews-carteirinha');
  let streamCart;
  let fotosCarteirinha = [];

  abrirCamCart.addEventListener('click', async () => {
    try {
      streamCart = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      videoCart.srcObject = streamCart;
      cameraContainerCart.style.display = "block";
    } catch (err) {
      alert("Erro ao abrir câmera: " + err.message);
    }
  });

  btnFotoCart.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoCart.videoWidth;
    canvas.height = videoCart.videoHeight;
    canvas.getContext('2d').drawImage(videoCart, 0, 0);
    canvas.toBlob(blob => {
      fotosCarteirinha.push(blob);
      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
      previewsCart.appendChild(img);
    }, 'image/jpeg');
  });

  btnFecharCart.addEventListener('click', () => {
    if (streamCart) streamCart.getTracks().forEach(track => track.stop());
    cameraContainerCart.style.display = "none";
  });

  // ===== Assinatura =====
  clearButton.addEventListener('click', () => signaturePad.clear());

  // ===== Envio =====
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = document.getElementById('submit-btn');
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    if (signaturePad.isEmpty()) {
      alert("Por favor, forneça sua assinatura.");
      submitButton.disabled = false;
      submitButton.textContent = "Enviar";
      return;
    }

    const formData = new FormData(form);
    formData.set('AssinaturaBase64', signaturePad.toDataURL('image/png'));

    // Viatura
    const viaturaBase64 = await Promise.all(fotosViatura.map(file => toBase64(file)));
    viaturaBase64.forEach((base64, i) => formData.append(`MidiaBase64_${i}`, base64));

    // Carteirinha
    const cartBase64 = await Promise.all(fotosCarteirinha.map(file => toBase64(file)));
    cartBase64.forEach((base64, i) => formData.append(`CarteirinhaBase64_${i}`, base64));

    // Galeria
    const galeriaFiles = Array.from(midiaInputGaleria.files);
    for (let i = 0; i < galeriaFiles.length; i++) {
      const base64 = await toBase64(galeriaFiles[i]);
      formData.append(`MidiaBase64_${viaturaBase64.length + i}`, base64);
    }

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbzbAyw6_QTRsM4vjkXe7I-dq30p061fCt9qzaKn0-aoBCM6USfX_8I4CDz9_JVgMsU2Jw/exec", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (result.status === "success") {
        sessionStorage.setItem("pdfUrl", result.pdf);
        window.location.href = "sucesso.html";
      } else {
        alert("Erro: " + result.message);
      }
    } catch (err) {
      alert("Erro ao enviar: " + err.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar";
    }
  });

  function toBase64(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
});
