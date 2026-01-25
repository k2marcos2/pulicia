document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklist-form');
  const midiaInputGaleria = document.getElementById('midia');
  const canvas = document.getElementById('signature-pad');

  // 🔗 URL do App Script
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhXjZITeixPDIPGji5bft0HAqX0DUla7LEIL4esx_H3jxQVFttkvpBTc14eQHii-n-fA/exec";

  // ===========================================
  // ⬇️ LÓGICA CONDICIONAL DOS CAMINHÕES ⬇️
  // ===========================================
  const veiculoSelect = document.getElementById('veiculo-select');
  const caminhaoContainer = document.getElementById('campos-caminhao-container');

  function atualizarCamposCaminhao() {
    if (!veiculoSelect || !caminhaoContainer) return;

    const veiculoSelecionado = veiculoSelect.value;

    if (veiculoSelecionado === "Caminhão Novo" || veiculoSelecionado === "Caminhão Velho") {
      caminhaoContainer.style.display = 'block';
    } else {
      caminhaoContainer.style.display = 'none';

      // Limpa campos quando esconder (recomendado)
      const inputs = caminhaoContainer.querySelectorAll('input, select');
      inputs.forEach(input => {
        if (input.type === 'number') input.value = '';
        else if (input.tagName === 'SELECT') input.value = 'N/A';
      });
    }
  }

  if (veiculoSelect && caminhaoContainer) {
    veiculoSelect.addEventListener('change', atualizarCamposCaminhao);
    atualizarCamposCaminhao(); // aplica no carregamento
  }
  // ===========================================
  // ⬆️ FIM DA LÓGICA CONDICIONAL ⬆️
  // ===========================================

  // ===============================
  // AJUSTE DE CANVAS (ASSINATURA)
  // ===============================
  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const signaturePad = new SignaturePad(canvas);
  const clearButton = document.getElementById('clear-signature');

  // ===============================
  // SELECT "OUTRO"
  // ===============================
  function setupSelectOutro() {
    document.querySelectorAll(".select-outro").forEach(select => {
      const box = document.getElementById(select.dataset.outro);
      if (!box) return;

      const extraField = box.querySelector("input, textarea");
      if (!extraField) return;

      function toggle() {
        const isOutro = (select.value || "").toLowerCase() === "outro";
        box.style.display = isOutro ? "block" : "none";
        extraField.required = isOutro;

        if (!isOutro) extraField.value = "";
      }

      select.addEventListener("change", toggle);
      toggle(); // aplica no carregamento
    });
  }
  setupSelectOutro();

  function applyOutroToFormData(formData, selectName, extraName) {
    const select = document.querySelector(`select[name="${selectName}"]`);
    const extra = document.querySelector(`[name="${extraName}"]`);
    if (!select || !extra) return;

    if ((select.value || "").toLowerCase() === "outro") {
      const txt = (extra.value || "").trim();
      formData.set(selectName, `Outro: ${txt}`);
    }
  }

  // ===============================
  // VIATURA
  // ===============================
  const abrirCamViatura = document.getElementById('abrir-camera-viatura');
  const cameraContainerViatura = document.getElementById('camera-container-viatura');
  const videoViatura = document.getElementById('camera-viatura');
  const btnFotoViatura = document.getElementById('tirar-foto-viatura');
  const btnFecharViatura = document.getElementById('fechar-camera-viatura');
  const previewsViatura = document.getElementById('previews-viatura');
  let streamViatura;
  let fotosViatura = [];

  if (abrirCamViatura) {
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
  }

  if (btnFotoViatura) {
    btnFotoViatura.addEventListener('click', () => {
      const canvasTemp = document.createElement('canvas');
      canvasTemp.width = videoViatura.videoWidth;
      canvasTemp.height = videoViatura.videoHeight;
      canvasTemp.getContext('2d').drawImage(videoViatura, 0, 0);

      canvasTemp.toBlob(blob => {
        const index = fotosViatura.push(blob) - 1;

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
        btnRemover.className = "btn-remover-foto";

        btnRemover.addEventListener('click', () => {
          wrapper.remove();
          fotosViatura.splice(index, 1);
        });

        wrapper.appendChild(img);
        wrapper.appendChild(btnRemover);
        previewsViatura.appendChild(wrapper);
      }, 'image/jpeg');
    });
  }

  if (btnFecharViatura) {
    btnFecharViatura.addEventListener('click', () => {
      if (streamViatura) streamViatura.getTracks().forEach(track => track.stop());
      cameraContainerViatura.style.display = "none";
    });
  }

  // ===============================
  // CARTÃO DE ABASTECIMENTO
  // ===============================
  const abrirCamCartao = document.getElementById('abrir-camera-cartao');
  const cameraContainerCartao = document.getElementById('camera-container-cartao');
  const videoCartao = document.getElementById('camera-cartao');
  const btnFotoCartao = document.getElementById('tirar-foto-cartao');
  const btnFecharCartao = document.getElementById('fechar-camera-cartao');
  const previewsCartao = document.getElementById('previews-cartao');
  let streamCartao;
  let fotosCartao = [];

  if (abrirCamCartao) {
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
  }

  if (btnFotoCartao) {
    btnFotoCartao.addEventListener('click', () => {
      const canvasTemp = document.createElement('canvas');
      canvasTemp.width = videoCartao.videoWidth;
      canvasTemp.height = videoCartao.videoHeight;
      canvasTemp.getContext('2d').drawImage(videoCartao, 0, 0);

      canvasTemp.toBlob(blob => {
        const index = fotosCartao.push(blob) - 1;

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
        btnRemover.className = "btn-remover-foto";

        btnRemover.addEventListener('click', () => {
          wrapper.remove();
          fotosCartao.splice(index, 1);
        });

        wrapper.appendChild(img);
        wrapper.appendChild(btnRemover);
        previewsCartao.appendChild(wrapper);
      }, 'image/jpeg');
    });
  }

  if (btnFecharCartao) {
    btnFecharCartao.addEventListener('click', () => {
      if (streamCartao) streamCartao.getTracks().forEach(track => track.stop());
      cameraContainerCartao.style.display = "none";
    });
  }

  // ===============================
  // ASSINATURA
  // ===============================
  if (clearButton) {
    clearButton.addEventListener('click', () => signaturePad.clear());
  }

  // ===============================
  // ENVIO DO FORMULÁRIO
  // ===============================
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

    // ✅ Junta checkboxes de Equipamentos Obrigatórios
    const equipamentos = Array.from(
      document.querySelectorAll('input[name="EquipamentosObrigatorios"]:checked')
    ).map(el => el.value);
    formData.delete("EquipamentosObrigatorios");
    formData.append("EquipamentosObrigatorios", equipamentos.join(", "));

    // ✅ Aplica "Outro: texto" nos selects configurados
    applyOutroToFormData(formData, "NivelCombustivel", "NivelCombustivelOutro");
    applyOutroToFormData(formData, "Pneus", "PneusOutro");
    applyOutroToFormData(formData, "GiroflexSirene", "GiroflexSireneOutro");
    applyOutroToFormData(formData, "Parabrisa", "ParabrisaOutro");
    applyOutroToFormData(formData, "Radio", "RadioOutro");

    // ✅ Assinatura
    formData.set('AssinaturaBase64', signaturePad.toDataURL('image/png'));

    // ✅ Fotos da viatura
    const viaturaBase64 = await Promise.all(fotosViatura.map(file => toBase64(file)));
    viaturaBase64.forEach((base64, i) => formData.append(`MidiaBase64_${i}`, base64));

    // ✅ Fotos do cartão
    const cartaoBase64 = await Promise.all(fotosCartao.map(file => toBase64(file)));
    cartaoBase64.forEach((base64, i) => formData.append(`CartaoBase64_${i}`, base64));

    // ✅ Galeria
    const galeriaFiles = Array.from(midiaInputGaleria.files || []);
    for (let i = 0; i < galeriaFiles.length; i++) {
      const base64 = await toBase64(galeriaFiles[i]);
      formData.append(`MidiaBase64_${viaturaBase64.length + i}`, base64);
    }

    // ===============================
    // ENVIA PARA O APP SCRIPT
    // ===============================
    try {
      const response = await fetch(SCRIPT_URL, {
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

  // ===============================
  // BASE64 HELPER
  // ===============================
  function toBase64(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
});
