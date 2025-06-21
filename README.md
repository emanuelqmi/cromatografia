# Simulação Interativa de Cromatografia de Papel

Este projeto é uma simulação interativa e educacional do processo de cromatografia em papel, desenvolvida para ajudar estudantes e professores a visualizar os conceitos de polaridade, fases móvel e estacionária, e fator de retenção (Rf) de uma maneira dinâmica e prática.

A aplicação foi construída utilizando apenas tecnologias web padrão (HTML, CSS e JavaScript), sendo leve, responsiva e acessível diretamente pelo navegador, sem necessidade de instalação. A aplicação foi inteiramente construída em colaboração com o **Gemini Pro**, uma Inteligência Artificial do Google, demonstrando o potencial de IAs como ferramentas de desenvolvimento e criação para fins educacionais.

## 🧪 Demonstração Online

Você pode acessar a simulação diretamente no seu navegador através do GitHub Pages:

**[https://emanuelqmi.github.io/cromatografia/](https://emanuelqmi.github.io/cromatografia/)**

## ✨ Funcionalidades

-   **Adição de Amostras Personalizadas:** Adicione até 8 amostras, definindo a polaridade (de 0% a 100%) para cada uma.
-   **Controle da Fase Móvel:** Ajuste a polaridade do solvente (fase móvel) com um slider interativo e veja como isso afeta o resultado.
-   **Animação em Tempo Real:** Assista à "corrida" cromatográfica com a frente do solvente e as amostras subindo pelo papel de forma visual e sincronizada.
-   **Escala Visual:** Uma régua de 0 a 7 cm é exibida ao lado do papel para permitir medições visuais.
-   **Resultados Quantitativos:** Ao final da simulação, a distância percorrida por cada amostra é exibida, fornecendo os dados necessários para o cálculo do Fator de Retenção (Rf).
-   **Legenda Dinâmica:** Uma legenda identifica cada amostra por sua cor e informa sua polaridade e os resultados da corrida.
-   **Controles Intuitivos:** Inicie, reinicie e limpe a simulação com botões de controle claros e com estados (ativo/desativado) bem definidos.

## 🚀 Como Usar

1.  **Adicionar Amostras:** No painel de controle, defina a polaridade desejada para uma nova amostra no campo "Polaridade da Nova Amostra" e clique em "Adicionar Amostra".
2.  **Ajustar o Solvente:** Utilize o slider "Polaridade do Solvente" para definir a polaridade da fase móvel.
3.  **Iniciar a Simulação:** Clique em "Iniciar Cromatografia" para começar a animação.
4.  **Observar os Resultados:** Observe as manchas se separando. Ao final, a legenda será atualizada com a distância percorrida por cada uma.
5.  **Calcular o Rf:** Com a régua e os dados de distância, os alunos podem calcular o Fator de Retenção de cada amostra.
6.  **Reiniciar:** Clique em "Reiniciar Simulação" para preparar uma nova corrida com as mesmas amostras (útil para testar diferentes polaridades de solvente) ou em "Limpar Amostras" para começar do zero.

## 🔬 Conceitos Científicos Abordados

-   **Cromatografia em Papel:** A simulação demonstra a separação de componentes de uma mistura baseada em suas diferentes afinidades pela fase estacionária (o papel, que é polar) e pela fase móvel (o solvente).
-   **Polaridade:** O princípio "semelhante dissolve semelhante" é o coração da simulação. Amostras apolares interagem pouco com o papel polar e são facilmente arrastadas por qualquer solvente. Amostras polares interagem fortemente com o papel e só são arrastadas eficientemente por solventes também polares.
-   **Fator de Retenção (Rf):** Embora a simulação não calcule o Rf automaticamente (para servir como exercício), ela fornece todos os dados para que os alunos o façam. A fórmula é:
    $$
    Rf = \frac{\text{Distância percorrida pela amostra}}{\text{Distância percorrida pelo solvente}}
    $$
    Na simulação, a distância percorrida pelo solvente é sempre o topo da escala (7 cm).

## 🛠️ Tecnologias Utilizadas

-   **HTML5:** Estrutura semântica do projeto.
-   **CSS3:** Estilização, layout responsivo com Flexbox, animações com `transition` e customização de elementos com variáveis e pseudo-elementos.
-   **JavaScript (ES6+):** Toda a lógica da simulação, manipulação do DOM e interatividade.
-   Gemnine PRO - Versão 2.5

## ✍️ Autores

Este projeto foi idealizado por Tiara Costa e Emanuel Dornelas.
