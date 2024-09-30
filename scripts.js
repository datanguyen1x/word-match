async function fetchData() {
    try {
        const response = await fetch('./data/gsl-filter.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Lỗi khi lấy dữ liệu: ', error);
    }
}

let selected = [];
let remainWords = 0;
let tenParts = null;

loadData();

const scoreID = document.getElementById('score');
const restartBtnID = document.getElementById('restartBtn');
const remainWordsID = document.getElementById('remainWords');
const optionId = document.getElementById('optionId');
const listID = document.getElementById('listID');
const sheetID = document.getElementById('sheetID');
const closeModal = document.getElementById('close-modal');
const sheetContent = document.getElementById('sheetContent');
const oweWords = document.getElementById('oweWords');


restartBtnID.addEventListener('click', restartGame);
optionId.addEventListener('change', choosePart);
listID.addEventListener('click', () => {
    sheetID.style.display = "block";
    fillTable();
});
closeModal.addEventListener('click', () => sheetID.style.display = "none");


async function loadData() {
    try {
        const data = await fetchData();
        if (data && data.length > 0) {
            localStorage.setItem('mwdt', JSON.stringify(data));
            tenParts = separateData(10);
            updateInfo();
            createBoard();
            fillSection();

        } else {
            console.error('Không có dữ liệu để lưu trữ.');
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

function restartGame() {
    loadData();
    selected = [];
}

function updateInfo() {
    const getdata = localStorage.getItem('mwdt');
    const data = JSON.parse(getdata);
    remainWordsID.textContent = data.length;
}

function random(data) {
    return Math.floor(Math.random() * data.length);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getData() {
    const getdata = localStorage.getItem('mwdt');
    return JSON.parse(getdata);
}

function createBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = ''; // Xóa nội dung cũ

    const data = getData();

    updateInfo();

    const tempArray = [];
    const setWords = new Set();
    let i = 0;
    let max = 4;
    if (data.length <= 4) {
        max = data.length;
    }
    while (i < max) {
        const randomWord = random(data);
        if (!setWords.has(randomWord)) {
            setWords.add(randomWord);
            tempArray.push([randomWord, data[randomWord]]);
            i++;
        }
    }
    const wordsColumn1 = tempArray.map(item => [item[0], item[1].word]);
    const wordsColumn2 = tempArray.map(item => [item[0], item[1].mean]);

    shuffle(wordsColumn1);
    shuffle(wordsColumn2);

    for (let i = 0; i < max; i++) {
        const card1 = createCard(wordsColumn1[i][0], wordsColumn1[i][1]);
        const card2 = createCard(wordsColumn2[i][0], wordsColumn2[i][1]);
        gameBoard.appendChild(card1);
        gameBoard.appendChild(card2);
    }
}

function createCard(value, word) {
    const card = document.createElement('div');
    card.textContent = word;
    card.setAttribute('data-word', value);
    card.classList.add('card');
    card.addEventListener('click', () => selectCard(card, word));
    return card;
}

function selectCard(card, word) {
    if (selected.length < 2 && !card.classList.contains('selected')) {
        card.classList.add('selected');
        selected.push({ card, word });
        if (selected.length === 2) {
            setTimeout(checkMatch, 300);
        }
    }
}

function checkMatch() {
    const [first, second] = selected;
    const firstWord = first.card.getAttribute('data-word');
    const secondWord = second.card.getAttribute('data-word');
    if ((firstWord === secondWord)) {
        // Xử lý cặp từ khớp
        setTimeout(() => {
            removeMatchPair(firstWord);
            createBoard();
        }, 300);
    } else {
        // Xử lý cặp từ không khớp
        setTimeout(() => {
            first.card.classList.remove('selected');
            second.card.classList.remove('selected');
            updateInfo();
        }, 300);
    }
    selected = [];
}

function removeMatchPair(index) {
    const data = getData();
    data.splice(index, 1);
    localStorage.setItem("mwdt", JSON.stringify(data));
}

function fillTable() {
    sheetContent.innerHTML = ``;
    const data = getData();
    for (let i = 0; i < data.length; i++) {
        const div = document.createElement('tr');
        div.innerHTML = `
            <td>${i + 1}</td>
            <td>${data[i].word}</td>
            <td>${data[i].mean}</td>`;
        sheetContent.appendChild(div);
    }
}

function separateData(numParts) {
    const data = getData();
    const parts = [];
    const partSize = Math.ceil(data.length / numParts);

    for (let i = 0; i < numParts; i++) {
        parts.push(data.slice(i * partSize, (i + 1) * partSize));
    }

    return parts;
}

function fillSection() {
    for (let i = 0; i < 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i + 1;
        optionId.appendChild(option);
    }
}

function choosePart() {
    localStorage.setItem('mwdt', JSON.stringify(tenParts[this.value]));
    const allword = tenParts[this.value].map(e => e.word);
    console.log(allword.join());
    createBoard();
}