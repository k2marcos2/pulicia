document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Exemplo de ação: exibir alerta de sucesso
        alert("Formulário enviado com sucesso!");

        // Aqui você pode adicionar lógica para enviar os dados, se necessário
        // como via fetch() para um backend
    });
});
