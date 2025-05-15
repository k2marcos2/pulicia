document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklist-form');
  const fotoInput = document.getElementById('foto-motorista');
  
  // Configuração da área de assinatura
  const canvas = document.getElementById('signature-pad');
  const signaturePad = new SignaturePad(canvas);
  const clearButton = document.getElementById('clear-signature');
  const signatureInput = document.getElementById('assinatura-base64');
  
  // Botão para limpar assinatura
  clearButton.addEventListener('click', () => {
    signaturePad.clear();
    signatureInput.value = '';
  });

  // Ajusta o canvas quando a janela é redimensionada
  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    signaturePad.clear(); // Limpa ao redimensionar
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Valida se a assinatura foi feita
    if (signaturePad.isEmpty()) {
      alert('Por favor, forneça sua assinatura digital');
      return;
    }
    
    // Converte a assinatura para base64
    signatureInput.value = signaturePad.toDataURL('image/png');

    const formData = new FormData(form);
    const data = {};
    
    // Processa os dados do formulário
    formData.forEach((value, key) => {
      if (data[key]) {
        data[key] += `, ${value}`;
      } else {
        data[key] = value;
      }
    });

    // Processa a foto
    if (fotoInput.files.length > 0) {
      const fotoFile = fotoInput.files[0];
      const fotoBase64 = await toBase64(fotoFile);
      data.FotoBase64 = fotoBase64;
      data.FotoNome = fotoFile.name;
    }

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbwAKKH7JItEu4SpoybmN5nsvymNdTit5_RHkgULU-HRjyUQXMLAa2INBR-zyn2ZUVQFvQ/exec", {
        method: "POST",
        body: JSON.stringify(data)
      });
      alert("Formulário enviado com sucesso!");
      form.reset();
      signaturePad.clear(); // Limpa a assinatura após envio
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar o formulário.");
    }
  });

  // Função para converter arquivo para base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }
  function criarPDF(data, assinaturaURL, fotoURL, folderId) {
  const doc = DocumentApp.create(`Cautela - ${data.Motorista || 'Motorista'}`);
  const body = doc.getBody();

  body.appendParagraph("CHECKLIST DE CAUTELA DE VIATURA").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`Data de envio: ${new Date().toLocaleString("pt-BR")}`);
  body.appendParagraph(`Motorista: ${data.Motorista || ""}`);
  body.appendParagraph(`Data da Cautela: ${data.DataCautela || ""}`);
  body.appendParagraph(`Hora da Cautela: ${data.HoraCautela || ""}`);
  body.appendParagraph(`Validade CNH: ${data.ValidadeCNH || ""}`);
  body.appendParagraph(`Categoria CNH: ${data.CategoriaCNH || ""}`);
  body.appendParagraph(`Veículo: ${data.Veiculo || ""}`);
  body.appendParagraph(`Prefixo: ${data.Prefixo || ""}`);
  body.appendParagraph(`Placa: ${data.Placa || ""}`);
  body.appendParagraph(`Km Atual: ${data.KmAtual || ""}`);
  body.appendParagraph(`Km Próxima Revisão: ${data.KmProxRevisao || ""}`);
  body.appendParagraph(`Nível de Água: ${data.NivelAgua || ""}`);
  body.appendParagraph(`Óleo do Motor: ${data.NivelOleo || ""}`);
  body.appendParagraph(`Combustível: ${data.NivelCombustivel || ""}`);
  body.appendParagraph(`Pneus: ${data.Pneus || ""}`);
  body.appendParagraph(`Giroflex/Sirene: ${data.GiroflexSirene || ""}`);
  body.appendParagraph(`Lâmpadas Queimadas: ${data.LampadasQueimadas || ""}`);
  body.appendParagraph(`Parabrisa: ${data.Parabrisa || ""}`);
  body.appendParagraph(`Rádio: ${data.Radio || ""}`);
  body.appendParagraph(`Equipamentos Obrigatórios: ${data.EquipamentosObrigatorios || ""}`);
  body.appendParagraph(`Quantidade de Cones: ${data.QtdCones || ""}`);
  body.appendParagraph(`Outros Problemas: ${data.OutrosProblemas || ""}`);
  body.appendParagraph(`Foto da Viatura: ${fotoURL}`);

  // Inserir a imagem da assinatura
  if (assinaturaURL !== "Sem assinatura" && assinaturaURL !== "Erro no upload") {
    try {
      const response = UrlFetchApp.fetch(assinaturaURL);
      const blob = response.getBlob();
      body.appendParagraph("Assinatura:");
      body.appendImage(blob);
    } catch (e) {
      body.appendParagraph("⚠ Erro ao carregar assinatura.");
    }
  }

  doc.saveAndClose();
  const pdf = DriveApp.getFileById(doc.getId()).getAs("application/pdf");

  const folder = DriveApp.getFolderById(folderId);
  const pdfFile = folder.createFile(pdf);
  return pdfFile.getUrl();
}

});