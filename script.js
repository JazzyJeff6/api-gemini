const apikeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')
const sidebar = document.getElementById('history')
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn')
const body = document.body


const toggleSidebar = () => {
    sidebar.classList.toggle('closed')
    body.classList.toggle('sidebar-closed')
}

toggleSidebarBtn.addEventListener('click', toggleSidebar);


const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

const perguntarIA = async (question, game, apiKey) => {
    const model = 'gemini-2.5-flash'
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const perguntaLOL = `
        ## Especialidade
        Você é um especialista em League of Legends, com conhecimento atualizado do meta atual e dos patches mais recentes. ${game}

        ## Tarefa
        Quero que me diga a melhor build possível para o seguinte campeão:

        ## Regras
        Campeão: [NOME DO CAMPEÃO]

        Rota: [TOP / MID / ADC / SUP / JG]

        Estilo de jogo: [agressivo / seguro / scaling / split push / roaming etc]

        Composição inimiga: [Ex.: muito AP / muito CC / campeões móveis etc]

        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coernete.

        - Nunca responda itens que Você não tenha certeza que exista no patch atual.

        - Responda com no maximo 1400 caracteres

        ## Resposta
        Melhor ordem de habilidades

        Melhores runas (e por quê)

        Itens iniciais, principais e situacionais (explicando as escolhas)

        Dicas estratégicas com base na build

        Qualquer ajuste importante com base no patch atual (se souber)  

        ---

        Aqui esta a pergunta do Usuário: ${question}
    `

    const perguntaValo = `

        ## Especialidade
        Você é um estrategista profissional de Valorant com profundo conhecimento de agentes, mapas e táticas atualizadas com base no meta atual. ${game}

        ## Tarefa
        Quero que me diga a melhor estratégia para ataque ou defesa dos mapas de valorant.

        ## Regras
        - Considere a data atual ${new Date().toLocaleDateString()}
        Agente que estou jogando: NOME DO AGENTE

        Mapa: HAVEN / ASCENT / ICEBOX / etc
        Função no time: Duelista / Sentinela / Iniciador / Controlador

        Lado atual: ATAQUE / DEFESA

        Estilo de jogo preferido: Agressivo / Tático / Suporte / Lento e calculado / Rush rápido

        Composição do meu time (opcional): Ex: Jett, Omen, Killjoy, Skye, Phoenix

        Composição do time inimigo (opcional): Ex: Chamber, Reyna, Astra, Sova, KAY/O

        - Responda com no maximo 1400 caracteres

        ## Resposta
        Estratégias específicas para o lado atual (ATAQUE ou DEFESA)

        Como usar melhor as habilidades do meu agente nesse mapa

        Dicas de posicionamento e timings úteis

        Como adaptar minha estratégia caso estejamos perdendo

        Se possível, alguma call curta e prática para usar com o time.

        Pergunta do usuário: ${question}
    `

    const perguntaCS = `

    ## Especialidade
        Você é um treinador tático profissional de CS:GO, com experiência em estratégias para matchmaking, FACEIT, campeonatos e CS2. ${game}

    ## Tarefa
        Com base nos dados a seguir, me diga as melhores estratégias e decisões táticas.

    ## Regras   
       - Considere a data atual ${new Date().toLocaleDateString()}
    
       Mapa: Ex: Mirage / Inferno / Overpass / Ancient / Dust2 / Nuke / Vertigo
    
       Lado atual: CT / TR
    
        Situação de economia: Buy completo / Semi-buy / Forçado / Eco seco
    
       Função no time: Entry / Suporte / AWPer / Lurker / IGL / Anchora / Rotação rápida
    
       Arma atual: AK-47 / AWP / M4A1 / MP9 / Deagle etc
    
       Estilo preferido de jogo: Agressivo / Padrão / Explosivo / Lento e tático / Fake play / Default controlado

        - Responda com no maximo 1400 caracteres

    ## Resposta
        Onde devo jogar e posicionar smokes/molotovs

        Como jogar solo no bomb B de forma eficaz

        Como comunicar info sem entregar rotações falsas

        Como reagir se o time tomar mid muito cedo

        Uma call objetiva pro time sobre split B
    
        Pergunta do usuário: ${question}
    `

    let perguntaFinal = ''

    if (game === 'lol') {
        perguntaFinal = perguntaLOL
    }else if (game === 'Valorant') {
                perguntaFinal = perguntaValo
            }else if(game === 'csgo'){
                perguntaFinal = perguntaCS
            }
    


    const contents = [{
        role: 'user',
        parts: [{
            text: perguntaFinal
        }]
    }]

    const tools = [{
        google_search:{}
    }
    ]

    const response = await fetch(geminiURL, {
        method: `POST`,
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data= await response.json()
    return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
    event.preventDefault()
    const apiKey = apikeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey == '' || game == '' || question == '') {
        alert('Por favor preencha todos os campos')
        return 
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try{
      const text = await perguntarIA(question, game, apiKey)
    aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
    aiResponse.classList.remove('hidden')

        const template = document.getElementById('template-button')
        const newButton = template.cloneNode(true)

        newButton.removeAttribute('id')
        newButton.classList.remove('hidden')
        newButton.querySelector('.question-text').textContent = question

        newButton.addEventListener('click', () => {
          questionInput.value = question
          questionInput.focus()
          if (sidebar.classList.contains('closed')) {
            toggleSidebar();
          }
})

            document.getElementById('history').appendChild(newButton)


    } catch(error){
        console.log('Erro: ', error)
    } finally{
        askButton.disabled = false
        askButton.textContent = 'Perguntar'
        askButton.classList.remove('loading')
    }

}


form.addEventListener('submit', enviarFormulario)