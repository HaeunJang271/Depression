// DOM 요소들
const contentInput = document.getElementById('contentInput');
const saveBtn = document.getElementById('saveBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const newPostBtn = document.getElementById('newPostBtn');
const writingArea = document.getElementById('writingArea');
const postView = document.getElementById('postView');
const postContent = document.getElementById('postContent');
const bubbles = document.getElementById('bubbles');
const reactions = document.getElementById('reactions');
const reactionCounts = document.getElementById('reactionCounts');
const shareBtn = document.getElementById('shareBtn');

// Firebase 함수들
import { firestore } from './firebase-config.js';

// 현재 보고 있는 글 ID
let currentPostId = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadBubbles();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 글 저장
    saveBtn.addEventListener('click', savePost);
    
    // Enter 키로 저장
    contentInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            savePost();
        }
    });
    
    // 새 글 버튼
    if (newPostBtn) {
        newPostBtn.addEventListener('click', () => {
            showWritingArea();
        });
    }
    
    // 링크 복사
    copyLinkBtn.addEventListener('click', copyPostLink);
    
    // 공유 버튼
    shareBtn.addEventListener('click', sharePost);
    
    // 반응 버튼들
    reactions.addEventListener('click', (e) => {
        if (e.target.classList.contains('reaction-btn')) {
            const reactionType = e.target.dataset.type;
            addReaction(reactionType);
        }
    });
    
}

// 글 저장
async function savePost() {
    const content = contentInput.value.trim();
    if (!content) {
        alert('내용을 입력해주세요.');
        return;
    }
    
    try {
        saveBtn.textContent = '저장 중...';
        saveBtn.disabled = true;
        
        const noteId = await firestore.saveNote(content);
        
        // localStorage에 내 글 ID 저장
        const myPostIds = JSON.parse(localStorage.getItem('myPostIds') || '[]');
        myPostIds.push(noteId);
        localStorage.setItem('myPostIds', JSON.stringify(myPostIds));
        
        // 입력창 초기화
        contentInput.value = '';
        
        // 저장된 글 보기
        await showPost(noteId);
        
        alert('글이 저장되었습니다!');
        
    } catch (error) {
        console.error('글 저장 실패:', error);
        alert('글 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
        saveBtn.textContent = '저장';
        saveBtn.disabled = false;
    }
}

// 글 보기
async function showPost(noteId) {
    try {
        const note = await firestore.getNoteById(noteId);
        if (!note) {
            alert('글을 찾을 수 없습니다.');
            return;
        }
        
        currentPostId = noteId;
        postContent.textContent = note.content;
        
        // 반응 수 표시
        displayReactions(note.reactions);
        
        // 글 보기 영역 표시
        writingArea.style.display = 'none';
        postView.style.display = 'block';
        copyLinkBtn.style.display = 'inline-block';
        
    } catch (error) {
        console.error('글 보기 실패:', error);
        alert('글을 불러오는데 실패했습니다.');
    }
}

// 반응 표시
function displayReactions(reactions) {
    reactionCounts.innerHTML = '';
    
    Object.entries(reactions).forEach(([type, count]) => {
        if (count > 0) {
            const emojiMap = {
                smile: '😊',
                sad: '😢',
                neutral: '😐',
                thought: '💭',
                heart: '❤️'
            };
            
            const countElement = document.createElement('span');
            countElement.className = 'reaction-count';
            countElement.textContent = `${emojiMap[type]} ${count}`;
            reactionCounts.appendChild(countElement);
        }
    });
}

// 반응 추가
async function addReaction(reactionType) {
    if (!currentPostId) return;
    
    try {
        await firestore.addReaction(currentPostId, reactionType);
        
        // 현재 글 다시 로드
        const note = await firestore.getNoteById(currentPostId);
        displayReactions(note.reactions);
        
    } catch (error) {
        console.error('반응 추가 실패:', error);
        alert('반응 추가에 실패했습니다.');
    }
}

// 글쓰기 영역 표시
function showWritingArea() {
    writingArea.style.display = 'block';
    postView.style.display = 'none';
    copyLinkBtn.style.display = 'none';
    contentInput.focus();
    currentPostId = null;
}

// 버블 로드
async function loadBubbles() {
    try {
        const notes = await firestore.getPublicNotes(12);
        bubbles.innerHTML = '';
        
        if (notes.length === 0) {
            bubbles.innerHTML = '<p style="color: #64748b; text-align: center; padding: 2rem; grid-column: 1 / -1;">아직 공개된 글이 없습니다.</p>';
            return;
        }
        
        notes.forEach(note => {
            const bubbleElement = createBubbleElement(note);
            bubbles.appendChild(bubbleElement);
        });
        
    } catch (error) {
        console.error('버블 로드 실패:', error);
    }
}

// 버블 요소 생성
function createBubbleElement(note) {
    const bubbleElement = document.createElement('div');
    bubbleElement.className = 'bubble';
    bubbleElement.innerHTML = `
        <div class="bubble-content">${note.content.substring(0, 120)}${note.content.length > 120 ? '...' : ''}</div>
        <div class="bubble-time">${formatDate(note.createdAt)}</div>
    `;
    
    bubbleElement.addEventListener('click', () => showPost(note.id));
    return bubbleElement;
}

// 날짜 포맷팅
function formatDate(timestamp) {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return date.toLocaleDateString('ko-KR');
}

// 링크 복사
function copyPostLink() {
    if (!currentPostId) return;
    
    const url = `${window.location.origin}${window.location.pathname}?post=${currentPostId}`;
    navigator.clipboard.writeText(url).then(() => {
        alert('링크가 복사되었습니다!');
    }).catch(() => {
        alert('링크 복사에 실패했습니다.');
    });
}

// 공유하기
function sharePost() {
    if (!currentPostId) return;
    
    const url = `${window.location.origin}${window.location.pathname}?post=${currentPostId}`;
    
    if (navigator.share) {
        navigator.share({
            title: '우울 메모',
            text: '마음을 나누는 공간',
            url: url
        });
    } else {
        copyPostLink();
    }
}


// URL 파라미터로 글 보기
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    
    if (postId) {
        showPost(postId);
    }
}

// 페이지 로드 시 URL 파라미터 확인
checkUrlParams();
