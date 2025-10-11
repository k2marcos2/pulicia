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
      const index = fotosViatura.push(blob) - 1;

      // container da foto + botão
      const wrapper = document.createElement('div');
      wrapper.style.display = "inline-block";
      wrapper.style.position = "relative";
      wrapper.style.margin = "5px";

      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
      img.style.width = "120px";
      img.style.height = "auto";
      img.style.borderRadius = "6px";
      img.style.border = "1px solid #ccc";

      const btnRemover = document.createElement('button');
      btnRemover.textContent = "X";
      btnRemover.style.position = "absolute";
      btnRemover.style.top = "2px";
      btnRemover.style.right = "2px";
      btnRemover.style.background = "rgba(255,0,0,0.7)";
      btnRemover.style.color = "white";
      btnRemover.style.border = "none";
      btnRemover.style.borderRadius = "4px";
      btnRemover.style.cursor = "pointer";
      btnRemover.style.padding = "2px 6px";
      btnRemover.style.fontSize = "12px";

      btnRemover.addEventListener('click', () => {
        wrapper.remove(); // tira da tela
        fotosViatura.splice(index, 1); // tira do array
      });

      wrapper.appendChild(img);
      wrapper.appendChild(btnRemover);
      previewsViatura.appendChild(wrapper);
    }, 'image/jpeg');
  });

  btnFecharViatura.addEventListener('click', () => {
    if (streamViatura) streamViatura.getTracks().forEach(track => track.stop());
    cameraContainerViatura.style.display = "none";
  });

  // ===== Cartão de Abastecimento =====
  const abrirCamCartao = document.getElementById('abrir-camera-cartao');
  const cameraContainerCartao = document.getElementById('camera-container-cartao');
  const videoCartao = document.getElementById('camera-cartao');
  const btnFotoCartao = document.getElementById('tirar-foto-cartao');
  const btnFecharCartao = document.getElementById('fechar-camera-cartao');
  const previewsCartao = document.getElementById('previews-cartao');
  let streamCartao;
  let fotosCartao = [];

  abrirCamCartao.addEventListener('click', async () => {
    try {
      streamCartao = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      videoCartao.srcObject = streamCartao;
      cameraContainerCartao.style.display = "block";
    } catch (err) {
      alert("Erro ao abrir câmera: " + err.message);
    }
  });

  btnFotoCartao.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoCartao.videoWidth;
    canvas.height = videoCartao.videoHeight;
    canvas.getContext('2d').drawImage(videoCartao, 0, 0);

    canvas.toBlob(blob => {
      const index = fotosCartao.push(blob) - 1;

      // container da foto + botão
      const wrapper = document.createElement('div');
      wrapper.style.display = "inline-block";
      wrapper.style.position = "relative";
      wrapper.style.margin = "5px";

      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
      img.style.width = "120px";
      img.style.height = "auto";
      img.style.borderRadius = "6px";
      img.style.border = "1px solid #ccc";

      const btnRemover = document.createElement('button');
      btnRemover.textContent = "X";
      btnRemover.style.position = "absolute";
      btnRemover.style.top = "2px";
      btnRemover.style.right = "2px";
      btnRemover.style.background = "rgba(255,0,0,0.7)";
      btnRemover.style.color = "white";
      btnRemover.style.border = "none";
      btnRemover.style.borderRadius = "4px";
      btnRemover.style.cursor = "pointer";
      btnRemover.style.padding = "2px 6px";
      btnRemover.style.fontSize = "12px";

      btnRemover.addEventListener('click', () => {
        wrapper.remove(); // tira da tela
        fotosCartao.splice(index, 1); // tira do array
      });

      wrapper.appendChild(img);
      wrapper.appendChild(btnRemover);
      previewsCartao.appendChild(wrapper);
    }, 'image/jpeg');
  });

  btnFecharCartao.addEventListener('click', () => {
    if (streamCartao) streamCartao.getTracks().forEach(track => track.stop());
    cameraContainerCartao.style.display = "none";
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

    // Cartão de Abastecimento
    const cartaoBase64 = await Promise.all(fotosCartao.map(file => toBase64(file)));
    cartaoBase64.forEach((base64, i) => formData.append(`CartaoBase64_${i}`, base64));

    // Galeria
    const galeriaFiles = Array.from(midiaInputGaleria.files);
    for (let i = 0; i < galeriaFiles.length; i++) {
      const base64 = await toBase64(galeriaFiles[i]);
      formData.append(`MidiaBase64_${viaturaBase64.length + i}`, base64);
    }

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbx1WqA9ochJrNV0lzJ52b9k4hQxrjynw5ReLXbsBvV7RAvasweM7VCOKeZcIe0UXE8v/exec", {
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
