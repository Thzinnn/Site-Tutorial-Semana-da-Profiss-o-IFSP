# 🐢 Desafio ADS - Semana da Profissão IFSP

Uma aplicação web interativa e educacional desenvolvida para a **Semana da Profissão IFSP** do curso de **Análise e Desenvolvimento de Sistemas**. A plataforma utiliza o conceito da **Tartaruga (Turtle Graphics)** do Super Logo para ensinar os primeiros passos da **lógica de programação**.

---

## 📋 Sobre o Projeto

Este site foi desenvolvido para a **Feira de Profissões do IFSP Caraguatatuba** com o objetivo de apresentar aos alunos do ensino médio como é programar usando **Super Logo** - uma versão adaptada ao português da tradicional linguagem educacional **Logo**.

### Objetivo Principal
✅ Ensinar **comandos básicos do Super Logo** através de **5 desafios práticos**  
✅ Desenvolver **pensamento algorítmico** desde a primeira experiência  
✅ Motivar estudantes através de **sistema de gamificação** (pontos e badges)  
✅ Proporcionar **aprendizado interativo** sem necessidade de instalação  
✅ Servir como **porta de entrada** para o mundo da programação

---

## 🎮 Os 5 Desafios

| Desafio | Descrição | Objetivo |
|---------|-----------|----------|
| 🔲 **Quadrado** | Desenhar um quadrado com 100 passos em cada lado | Aprender loops e rotações básicas |
| 📐 **Escada** | Desenhar uma escada com 3 degraus (50x30 passos) | Trabalhar com estruturas repetitivas |
| 🎨 **Composição** | Desenhar quadrado + triângulo + hexágono | Combinar múltiplas formas |
| 🔤 **Letra** | Desenhar a primeira letra do seu nome | Decomposição e otimização |
| 🌟 **Criatividade** | Criar um desenho próprio | Liberdade criativa total |

---

## ✨ Funcionalidades

### 📊 Sistema de Progresso Automático
```javascript
✓ Salva automaticamente cada desafio completado
✓ Restaura progresso ao recarregar a página
✓ Sem necessidade de login ou conta
✓ Dados armazenados localmente (localStorage)
```

### 🏆 Sistema de Ranking com Badges

**Badges Conquistáveis:**
- 🌱 **Iniciante** - Completar 1º desafio (+100 pts)
- ⚡ **Intermediário** - Completar 3 desafios (+100 pts)
- 🏆 **Expert** - Completar todos os 5 desafios (+100 pts)

**Sistema de Pontos:**
- 100 pontos por desafio
- 500 pontos máximo
- Bônus de pontos por badges
- Ranking dinâmico em tempo real

### 🎨 Interface Moderna
- Design elegante com tema escuro
- Totalmente responsivo (mobile/tablet/desktop)
- Animações suaves
- Feedback visual em tempo real

---

## 🏗️ Estrutura Técnica

```
Site-Tutorial-Semana-da-Profissão-IFSP/
├── index.html                      # Página principal
├── README.md                       # Este arquivo
├── css/
│   └── style.css                  # Estilos responsivos
├── js/
│   ├── save-progress.js           # Sistema de progresso
│   └── ranking-system.js          # Sistema de ranking
└── image/
    └── Logo-IFSP.jfif            # Logo IFSP
```

### Tecnologias
- **HTML5** - Semântica
- **CSS3** - Grid, Flexbox, Variáveis
- **JavaScript Vanilla** - Sem dependências
- **LocalStorage API** - Persistência
- **Google Fonts** - Orbitron, Plus Jakarta Sans, JetBrains Mono

---

## 🚀 Como Usar

1. Abra a página no navegador
2. Leia as **instruções de Super Logo** disponíveis na página
3. Escolha um desafio para começar
4. Implemente cada desafio no **Super Logo**
5. Marque o checkbox quando concluir
6. Ganhe pontos e badges automaticamente
7. Divirta-se aprendendo a programar!

---

## 🎮 Exemplo de Desafio

---

## 💾 Dados Persistidos (LocalStorage)

```javascript
// Progresso dos desafios
'desafios-progresso-v1': {
  states: [true/false, ...]  // Status de cada desafio
}

// Dados do ranking
'desafios-ranking-v1': {
  points: 0,
  totalChallengesCompleted: 0,
  badges: ['iniciante', 'intermediario', 'expert'],
  // ... outros dados
}
```

---

## 🎛️ Controles

| Botão | Função |
|-------|--------|
| 🗑️ **Limpar Progresso** | Reseta todos os desafios e pontos |

---

## 📱 Compatibilidade

✅ Funciona em todos os navegadores modernos  
✅ Responsivo para desktop, tablet e mobile  
✅ Não requer internet após primeiro acesso  
✅ Sem instalação necessária

---

## 🎯 Diferenciais

🌟 **Gamificação** - Pontos e badges motivam os alunos  
🌟 **Progresso Persistente** - Sem perda de dados  
🌟 **Zero Dependências** - Código limpo e mantível  
🌟 **Design Moderno** - Interface atraente e funcional  
🌟 **Fácil de Usar** - Sem curva de aprendizado

---

## 📚 Conceitos Educacionais

- **Logo** - Linguagem educacional tradicional
- **Turtle Graphics** - Programação através de desenho
- **Algoritmos** - Sequência de comandos estruturados
- **Loops** - Repetição de instruções
- **Decomposição** - Quebrar problemas em partes menores

---

## 🔧 Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- Suporte a LocalStorage
- Conexão de internet (apenas na primeira visita)

---

## 📖 Instruções Super Logo (Na Página)

A aplicação inclui instruções visuais para:
- Comandos de movimento
- Rotação da tartaruga
- Exemplos práticos
- Dicas de otimização

---

## 🎓 Contexto

- **Instituição:** IFSP (Instituto Federal de São Paulo)
- **Campus:** Caraguatatuba
- **Evento:** Semana da Profissão / Feira de Profissões
- **Curso:** Análise e Desenvolvimento de Sistemas (ADS)
- **Público-alvo:** Alunos do ensino médio e fundamental II (11-18 anos)
- **Propósito:** Primeiro contato com programação através do Super Logo

---

## 📄 Licença

Desenvolvido para fins educacionais. Uso livre e gratuito.

---

**Desenvolvido com ❤️ para a Semana da Profissão IFSP Caraguatatuba**

`Faça a tartaruga desenhar. Aprenda a programar. Divirta-se! 🐢✨`

