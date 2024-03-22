console.log("JS loaded!")

function have_class(obj,name){
    if(obj)
    return obj.classList.contains(name)
}

function auto_save(){
    let block_container = document.querySelector(".block_container")
    document.auto_load = false
    let ctxt = new Popup()

    if(localStorage.getItem("saved_before") === "true"){
        ctxt.setup_varC()
        ctxt.show()
    } else {
        localStorage.setItem("saved_before","true")
    }

    setInterval(() => {
        if(!document.auto_load) return
        localStorage.setItem("saved_blocks",block_container.innerHTML)
    },1000)
}

function load_save(){
    let block_container = document.querySelector(".block_container")

    block_container.innerHTML = localStorage.getItem("saved_blocks")
}

function note_to_value(str){
    let char = str.replace(/[^a-gA-G]+/g, '').trim()

    let format = /[ `!@$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
    if(char == "" ||
       char.length > 1 ||
       format.test(str)) return undefined

    let base_note = 0
    switch(char){
        case "C":
            base_note = 0
            break
        case "D":
            base_note = 2
            break
        case "E":
            base_note = 4
            break
        case "F":
            base_note = 5
            break
        case "G":
            base_note = 7
            break
        case "A":
            base_note = 9
            break
        case "B":
            base_note = 11
            break
        case "H":
            base_note = 11
            break
    }

    let half_tone = str.includes("#")

    if(half_tone    && char !== "B" &&
       char !== "H" && char !== "E") base_note++
    else if(half_tone) return undefined

    let digit  = str.replace(/\D/g, '').trim()
    let octave = 0
    if(digit.length == 1 && digit < 7 && digit >= 0) octave = digit
    else return undefined

    return base_note + (12 * octave)
}

function fix_input_to_attr(obj){
    obj.setAttribute("value",obj.value)
}

function setup_global_settings(){
    document.use_autobinds = true
}

function setup_controllerA(rows_count = 6,rows_inds = ["E1","A1","D2","G2","B2","E3"]){
    let ctrl = document.querySelector(".controller.a")

    let newDom  = ""

    function gen_cellRow(){
        let cells   = ""
        for(let i = 0;i < 25;i++){
            cells  += `<div class = "cell color_oct${i}">${i}</div>`
        }

        return `<div class = "row">${cells}</div>`
    }

    let cellRows = ""
    for(let i = 0;i < rows_count;i++)
        cellRows += gen_cellRow()

    let setting_cells  = ""
    for(let i = 0;i < rows_count;i++)
        setting_cells += `
            <input class="cell setbar_btn" value="${rows_inds[rows_count - i - 1]}">
        `

        newDom += `
            <div class = "zero_wrap">
                <div class = "setting_bar">
                    <div class = "col">
                        ${setting_cells}
                    </div>
                </div>
            </div>
            <div class = "col interact">${cellRows}</div>
        `

        ctrl.innerHTML = newDom

    function setup_setbar(){
        let btns = document.querySelectorAll(".setting_bar .setbar_btn")
        let rows = document.querySelectorAll(".controller.a .row")

        for(let i = 0;i < btns.length;i++){
            let btn = btns[i]
            let cells = rows[i].querySelectorAll(".cell")

            for(let j = 0;j < cells.length;j++){
                let base_note = note_to_value(btn.value) + j
                if(base_note === undefined) continue
                let octave = (base_note + 1) / 12
                    octave = Math.floor(octave)
                let cell = cells[j]
                    cell.className = `cell color_oct${octave}`
            }
        }
    }


    setup_setbar()

    let set_btns = document.querySelectorAll(".setting_bar .setbar_btn")
    for(let set_btn of set_btns)
    set_btn.addEventListener("input",() => setup_setbar())
}

function setup_controllerB(){
    let ctrl = document.querySelector(".controller.b")

    let newDom  = ""

    let symbols = [
        "PM","-","━","T","*",
        "◠","⟋","~","()","X",
        "╹","┕","┴","╧","≣",
        "∎","|","▼","▲"," "
    ]

    function gen_cellRow(chars){
        let cells   = ""
        for(let ch of chars){
            cells  += `<div class = "cell">${ch}</div>`
        }

        return `<div class = "row">${cells}</div>`
    }

    let cellRows = ""
        cellRows+= gen_cellRow(symbols.slice(0,5))
        cellRows+= gen_cellRow(symbols.slice(5,10))
        cellRows+= gen_cellRow(symbols.slice(10,15))
        cellRows+= gen_cellRow(symbols.slice(15,20))

        newDom += `
            <div class = "col interact">${cellRows}</div>
        `

        ctrl.innerHTML = newDom
}

function setup_controllerC(){
    let ctrl = document.querySelector(".controller.c")

    let newDom  = ""

        newDom += `
            <div class = "row">
                <div class = "cell btn add_block">Add Block</div>
            </div>
        `

        ctrl.innerHTML = newDom

        ctrl.querySelector(".cell.add_block").addEventListener("click",() => {
            new Block().setup_block()
        })
}

class Popup {
    setup_events(){
        let ctxt = new Popup()
        let btn  = document.querySelector(".popup_bg .close_icon")

        btn.addEventListener("click",e => {
            ctxt.hide()
        })

        window.addEventListener('keydown',e => {
            let popup = document.querySelector(".popup_bg")

            if(e.key == 'Escape' && have_class(popup,"show")){
                ctxt.hide()
            }
        })

        document.addEventListener("click",e => {
            let target = e.target
            let btn    = target.closest(".del_btn")
            if(!btn) return

            document.querySelector(".block.active").remove()
            ctxt.hide()
        })

        document.addEventListener("click",e => {
            let target = e.target
            let btn    = target.closest(".load_btn")
            if(!btn) return

            load_save()
            ctxt.hide()
        })

        document.addEventListener("click",e => {
            let target = e.target
            let btn    = target.closest(`.global_settings [data-btn-act="clear_lc"]`)
            if(!btn) return

            localStorage.clear()
            document.auto_load = false
        })

        document.addEventListener("click",e => {
            let target = e.target
            let btn    = target.closest(`.global_settings [data-btn-act="save_lc"]`)
            if(!btn) return

            let block_container = document.querySelector(".block_container")
            localStorage.setItem("saved_blocks",block_container.innerHTML)
        })
    }

    setup_varA(){
        let popup = document.querySelector(".popup_bg .popup .pbody")
            popup.innerHTML = `
                <div class = "col align_center del_ctxt">
                    <span class = "text">Are you sure?</span>
                    <div class = "del_btn">Delete</div>
                </div>
            `
    }

    setup_varB(){
        let popup = document.querySelector(".popup_bg .popup .pbody")

        let ctxt = new Block()

            popup.innerHTML = `
                <div class = "col align_center copy_ctxt">
                    <span class = "text">Copy text to save</span>
                    <div class = "text_wrap">
                        <textarea class = "text selection">${ctxt.block_to_text()}</textarea>
                    </div>
                </div>
            `
    }

    setup_varC(){
        let popup = document.querySelector(".popup_bg .popup .pbody")

        let ctxt = new Block()

            popup.innerHTML = `
                <div class = "col align_center save_ctxt">
                    <span class = "text">Do you want to load save?</span>
                    <div class = "load_btn">Load</div>
                </div>
            `
    }

    setup(){
        let popup = document.querySelector(".popup_bg")
        let ctxt  = new Popup()
        ctxt.setup_events()
        document.auto_load = false
    }

    show(){
        document.auto_load = false
        let popup = document.querySelector(".popup_bg")
            popup.style.display = "flex"
            setTimeout(() =>
            popup.className = "popup_bg show"
            ,0)
    }

    hide(){
        document.auto_load = true
        let popup = document.querySelector(".popup_bg")
            popup.className = "popup_bg"
            setTimeout(() =>
            popup.style.display = "none"
            ,200)
    }
}

class Tick {
    tick(tick,prev){
        let ticked = document.querySelector(".block .ticked")
        if(ticked && prev) ticked.className = "tick"

        tick.className = "tick ticked"
    }

    untick(tick){
        tick.className = "tick"
    }

    setup(){
        let ctxt = new Tick()

        document.addEventListener("click",e => {
            let target = e.target
            let tick   = target.closest(".tick")
            if(!tick)return

            let closest_block = target.closest(".block")
            let prev          = closest_block ? true : false

            if(tick.className == "tick") ctxt.tick(tick,prev)
            else                         ctxt.untick(tick,prev)

            if(closest_block){
                let block = document.querySelector(".block.active")
                if(block) block.className = "block"

                target.closest(".block").className = "block active"
            }

            let option = tick.closest(".global_settings .tick")
            if(option){
                if(have_class(option,"ticked")) document.use_autobinds = true
                else                            document.use_autobinds = false
            }
        })
    }

}

class Block {
    block_to_text(){
        let block = document.querySelector(".block.active")

        let rows = block.querySelectorAll(".col.rows .row")

        let tabs = ""

        let strs = []
        for(let i = 0;i < rows.length;i++) strs.push("")

        let col_count = rows[0].querySelectorAll(".cell").length

        let cells_template = strs

        for(let i = 0;i < col_count;i++){
            let cells = []
            let class_lists = []
            let max_chars = 0

            for(let j = 0;j < rows.length;j++){
                let cell = rows[j].querySelector(`.cell:nth-child(${i + 1})`)
                let txt  = ""

                if(cell.tagName == "INPUT") txt = cell.value
                else                        txt = cell.innerHTML.replaceAll('&amp;', '&')

                max_chars    = Math.max(txt.length,max_chars)

                cells.push(txt)
                class_lists.push(cell.classList)
            }

            for(let j = 0;j < cells.length;j++){
                let pushtxt = ""

                let fill_symbol = " "

                     if(class_lists[j].contains("hold"))    fill_symbol = "━"
                else if(class_lists[j].contains("transit")) fill_symbol = "-"

                for(let o = 0;o < max_chars;o++){
                    let catched = cells[j][o]

                    if(catched === undefined) pushtxt += fill_symbol
                    else                      pushtxt += catched
                }

                strs[j] += pushtxt
            }
        }

        for(let i = 0;i < strs.length;i++){
            if(i !== (strs.length - 1)) tabs += `${strs[i]}\n`
            else                        tabs += `${strs[i]}`
        }

        let info_name    = block.querySelector(`[data-info="inp_name"]`).value
        let info_artist  = block.querySelector(`[data-info="inp_artist"]`).value
        let info_scale_a = block.querySelector(`[data-info="inp_scale_a"]`).value
        let info_scale_b = block.querySelector(`[data-info="inp_scale_b"]`).value
        let info_bpm     = block.querySelector(`[data-info="inp_BPM"]`).value

        let content = `
𝗡𝗮𝗺𝗲: ${info_name}; 𝗔𝗿𝘁𝗶𝘀𝘁: ${info_artist};
𝗦𝗰𝗮𝗹𝗲: ${info_scale_a}/${info_scale_b}; 𝗕𝗣𝗠: ${info_bpm};

${tabs}

Made in https://uniglyph.basil.ushakov.by`

        return content
    }

    add_cells(){
        let block = document.querySelector(".block.active")
        if(!block)return

        let rows = block.querySelectorAll(".col.rows .row")

        for(let row of rows){
            let index  = row.querySelector(".index")
            let newDom = ""
            switch(index.innerHTML.trim()){
                case "♫":
                    newDom += `
                        <div class = "cell"> </div>
                        <div class = "cell"> </div>
                    `
                    row.innerHTML += newDom
                    break
                case "&amp;":
                    newDom += `
                        <div class = "cell"> </div>
                        <div class = "cell"> </div>
                    `
                    row.innerHTML += newDom
                    break
                default:
                    newDom += `
                        <div class = "cell transit">-</div>
                        <div class = "cell hold">━</div>
                    `
                    row.innerHTML += newDom
                    break
            }
        }
    }

    remove_cells(){
        let block = document.querySelector(".block.active")
        if(!block) return

        let cells = Array.from(block.querySelector(".col.rows .row").querySelectorAll(".cell"))

        if(cells.length <= 5) return

        let rows = Array.from(block.querySelectorAll(".col.rows .row"))
        for(let row of rows){
            row.querySelector(".cell:last-child").remove()
            row.querySelector(".cell:last-child").remove()
        }
    }

    setup_events(){
        document.ctrl_status = ""
        document.ctrl_cell   = undefined

        let ctxt = new Block()

        document.addEventListener("click",e => {
            let target = e.target

            let cell = target.closest(".block.active .cell:not(:nth-child(2)):not(:nth-child(1))")
            if(!cell) return

            if(cell.classList.contains("index") ||
               cell.classList.contains("gate")){
                document.ctrl_status = ""
                return
            }

            document.ctrl_status = "await_effect"

            let ctxt = new Block()

            if(target.closest(".block.active .row .cell:last-child") && document.use_autobinds){
                let rows  = target.closest(".col.rows").querySelectorAll(".row")
                let crow  = target.closest(".row")
                let index = Array.from(rows).indexOf(crow)

                ctxt.add_cells()

                cell = document.querySelector(`.block.active .col.rows .row:nth-child(${1 + index}) .cell:nth-last-child(3)`)
            }

            document.ctrl_cell = cell
        })

        function controller_bind(target){
            let key = target.closest(".controller .cell")

            if(!key) return
            if(document.ctrl_status !== "await_effect") return

            if(!document.ctrl_cell){
                document.ctrl_status = ""
                return
            }

            let symbol = key.innerHTML

            function build_line(cell){
                let row = cell.closest(".row").querySelectorAll(".cell")
                    row = Array.from(row)
                let ind = row.indexOf(cell)

                let ncells = cell.closest(".rows").querySelectorAll(`.row .cell:nth-child(${ind + 1})`)
                for(let ncell of ncells) ncell.innerHTML = "|"
            }

                 if(symbol == "()")         document.ctrl_cell.innerHTML = `(${document.ctrl_cell.innerHTML})`
            else if(symbol == "|"
                 && document.use_autobinds) build_line(document.ctrl_cell)
            else                            document.ctrl_cell.innerHTML = symbol

            document.ctrl_status = ""
        }

        function ctrl_panel(target){
            let btn = target.closest(".block.active .ctrl_panel .row.functional .icon")

            let ctxt_popup = new Popup()

                 if(have_class(btn,"plus")) ctxt.add_cells()
            else if(have_class(btn,"minus")) ctxt.remove_cells()
            else if(have_class(btn,"trash")) {
                ctxt_popup.setup_varA()
                ctxt_popup.show()
            }
            else if(have_class(btn,"copy")) {
                ctxt_popup.setup_varB()
                ctxt_popup.show()
            }
        }

        document.addEventListener("click",e => {
            let target = e.target

            controller_bind(target)
            ctrl_panel(target)
        })
    }

    setup_tick(){
        let ctxt = new Tick()
            ctxt.setup()
    }

    setup_block(){
        let set_bar = document.querySelectorAll(".setting_bar .cell")

        let rows_inds = []
        for(let ind of set_bar) rows_inds.push(ind.value)

        let block_container = document.querySelector(".block_container")

        let ctxt = new Block()

        let active_block = document.querySelector(".block.active")
        if( active_block)
            active_block.className = "block"

        let newDom = ""

        function gen_cellRow(ind,type,symbol = true){
            let cells   = ""
                if(symbol)
                cells  += `<input class = "cell index" value = ${ind} onchange = "fix_input_to_attr(this)">`
                else
                cells  += `<div class = "cell index">${ind}</div>`

                cells  += `<div class = "cell gate">|</div>`
                if(symbol){
                cells  += `<div class = "cell hold">━</div>`
                cells  += `<div class = "cell transit">-</div>`
                cells  += `<div class = "cell hold">━</div>`
                }else{
                cells  += `<div class = "cell"> </div>`
                cells  += `<div class = "cell"> </div>`
                cells  += `<div class = "cell"> </div>`
                }

            return `<div class = "row ${type}">${cells}</div>`
        }

        let cellRows = ""
            cellRows += gen_cellRow("&","featrure",false)
        for(let i = 0;i < rows_inds.length;i++){
            cellRows += gen_cellRow(rows_inds[i],"string")
        }
            cellRows += gen_cellRow("♫","intervals",false)
            newDom += `
                <div class = "block active">
                    <div class = "ctrl_panel">
                        <div class = "row description">
                            <span>BPM</span>
                            <input placeholder = "120" value = "120" onchange = "fix_input_to_attr(this)" data-info = "inp_BPM">

                            <span>Scale</span>
                            <input placeholder = "4" value = "4" class = "short" onchange = "fix_input_to_attr(this)" data-info = "inp_scale_a">
                            <span>/</span>
                            <input placeholder = "4" value = "4" class = "short" onchange = "fix_input_to_attr(this)" data-info = "inp_scale_b">

                            <span>Name</span>
                            <input class = "long" placeholder = "Track Name" value = "Track" onchange = "fix_input_to_attr(this)" data-info = "inp_name">
                            <span>Artist</span>
                            <input class = "long" placeholder = "Artist" value = "Artist" onchange = "fix_input_to_attr(this)" data-info = "inp_artist">
                        </div>

                        <div class = "row functional">
                            <div class = "row">
                                <div class = "tick"><img src = "assets/imgs/tick.svg" class = "tick_icon"/></div>
                                <span>Active</span>
                            </div>

                            <img src = "assets/imgs/plus.svg" class = "plus icon"/>
                            <img src = "assets/imgs/minus.svg" class = "minus icon"/>
                            <img src = "assets/imgs/trash.svg" class = "trash icon"/>
                            <img src = "assets/imgs/copy.svg" class = "copy icon"/>
                        </div>
                    </div>
                    <div class = "col rows">
                        ${cellRows}
                    </div>
                </div>
            `

            block_container.innerHTML = newDom + block_container.innerHTML

            let ctxt2 = new Tick()
            let new_tick = document.querySelector(".block.active .tick")
                ctxt2.tick(new_tick,true)
    }

    setup(){
        let ctxt = new Block()
        ctxt.setup_block()
        ctxt.setup_tick()
        ctxt.setup_events()
    }
}

function main(){
    setup_global_settings()

    setup_controllerA()

    setup_controllerB()

    setup_controllerC()

    new Block().setup()
    new Popup().setup()

    auto_save()
}

window.onload = main
