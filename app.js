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
    console.log('페이지 로드 완료');
    console.log('bubbles 요소:', document.getElementById('bubbles'));
    loadBubbles();
    setupEventListeners();
    
    // 테스트용 샘플 데이터 추가 (데이터가 없을 때만)
    addSampleDataIfEmpty();
});

// 샘플 데이터 추가 (데이터가 없을 때만)
async function addSampleDataIfEmpty() {
    try {
        const notes = await firestore.getPublicNotes(1);
        if (notes.length === 0) {
            console.log('데이터가 없어서 샘플 데이터 추가 중...');
            
            const sampleNotes = [
                "오늘은 정말 힘든 하루였어요. 하지만 이렇게 글을 쓰니 마음이 조금 나아지네요.",
                "새로운 시작이 두려워요. 하지만 한 걸음씩 나아가고 있어요.",
                "혼자 있는 시간이 많아졌어요. 조용한 시간이 좋기도 하고 외롭기도 해요.",
                "오늘 하늘을 보니 마음이 편안해졌어요. 작은 것들에 감사하게 되네요.",
                "힘들 때마다 이곳에 와서 마음을 정리해요. 정말 도움이 되네요."
            ];
            
            for (const content of sampleNotes) {
                await firestore.saveNote(content);
                console.log('샘플 글 추가:', content.substring(0, 20) + '...');
            }
            
            console.log('샘플 데이터 추가 완료! 페이지를 새로고침합니다.');
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    } catch (error) {
        console.error('샘플 데이터 추가 실패:', error);
    }
}

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
    
    // 반응 버튼들 - 가장 간단한 방법
    document.addEventListener('click', (e) => {
        console.log('클릭된 요소:', e.target);
        console.log('클래스 목록:', e.target.classList);
        
        if (e.target.classList.contains('reaction-btn')) {
            console.log('✅ 반응 버튼 클릭됨!');
            const reactionType = e.target.dataset.type;
            console.log('반응 타입:', reactionType);
            
            addReaction(reactionType);
        } else {
            console.log('❌ 반응 버튼이 아님');
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
        console.log('글 저장 시작:', content);
        saveBtn.textContent = '저장 중...';
        saveBtn.disabled = true;
        
        const noteId = await firestore.saveNote(content);
        console.log('Firestore에 저장된 ID:', noteId);
        
        // localStorage에 내 글 ID 저장
        const myPostIds = JSON.parse(localStorage.getItem('myPostIds') || '[]');
        myPostIds.push(noteId);
        localStorage.setItem('myPostIds', JSON.stringify(myPostIds));
        console.log('localStorage에 저장된 ID 목록:', myPostIds);
        
        // 입력창 초기화
        contentInput.value = '';
        
        // 저장된 글 보기
        await showPost(noteId);
        
        // 버블 새로고침
        loadBubbles();
        
        alert('글이 저장되었습니다!');
        
    } catch (error) {
        console.error('글 저장 실패:', error);
        console.error('오류 상세:', error.message);
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
        
        // 사용자의 반응 상태로 버튼 업데이트
        const userReactions = JSON.parse(localStorage.getItem(`reactions_${currentPostId}`) || '{}');
        updateReactionButtons(userReactions);
        
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
    
    console.log('displayReactions - reactions:', reactions);
    
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

// 반응 버튼 상태 업데이트
function updateReactionButtons(userReactions) {
    const reactionButtons = document.querySelectorAll('.reaction-btn');
    console.log('updateReactionButtons - 버튼 개수:', reactionButtons.length);
    console.log('updateReactionButtons - userReactions:', userReactions);
    
    reactionButtons.forEach(button => {
        const reactionType = button.dataset.type;
        const isActive = userReactions[reactionType] || false;
        
        console.log(`버튼 ${reactionType}: ${isActive ? '활성' : '비활성'}`);
        
        if (isActive) {
            button.classList.add('reaction-active');
        } else {
            button.classList.remove('reaction-active');
        }
    });
}

// 반응 추가/제거 (토글)
async function addReaction(reactionType) {
    console.log('=== addReaction 함수 시작 ===');
    console.log('reactionType:', reactionType);
    console.log('currentPostId:', currentPostId);
    
    if (!currentPostId) {
        console.log('❌ currentPostId가 없습니다!');
        return;
    }
    
    try {
        // 현재 사용자의 반응 상태 확인
        const userReactions = JSON.parse(localStorage.getItem(`reactions_${currentPostId}`) || '{}');
        const hasReacted = userReactions[reactionType] || false;
        
        console.log('현재 반응 상태:', userReactions);
        console.log('이미 반응했는가:', hasReacted);
        
        if (hasReacted) {
            // 이미 반응한 경우 제거
            console.log('🔄 반응 제거 중...');
            await firestore.removeReaction(currentPostId, reactionType);
            userReactions[reactionType] = false;
            console.log('✅ 반응 제거 완료');
        } else {
            // 반응 추가
            console.log('➕ 반응 추가 중...');
            await firestore.addReaction(currentPostId, reactionType);
            userReactions[reactionType] = true;
            console.log('✅ 반응 추가 완료');
        }
        
        // 사용자 반응 상태 저장
        localStorage.setItem(`reactions_${currentPostId}`, JSON.stringify(userReactions));
        console.log('💾 저장된 반응 상태:', userReactions);
        
        // 즉시 UI 업데이트
        updateReactionButtons(userReactions);
        
        // 현재 글 다시 로드
        const note = await firestore.getNoteById(currentPostId);
        displayReactions(note.reactions);
        
        console.log('=== addReaction 함수 완료 ===');
        
    } catch (error) {
        console.error('❌ 반응 처리 실패:', error);
        alert('반응 처리에 실패했습니다: ' + error.message);
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
        console.log('버블 로드 시작...');
        const notes = await firestore.getPublicNotes(12);
        console.log('가져온 글 개수:', notes.length);
        
        if (!bubbles) {
            console.error('bubbles 요소를 찾을 수 없습니다!');
            return;
        }
        
        bubbles.innerHTML = '';
        
        if (notes.length === 0) {
            bubbles.innerHTML = '<p style="color: #64748b; text-align: center; padding: 2rem;">아직 공개된 글이 없습니다.</p>';
            console.log('공개된 글이 없어서 메시지 표시');
            return;
        }
        
        notes.forEach(note => {
            const bubbleElement = createBubbleElement(note);
            bubbles.appendChild(bubbleElement);
        });
        
        console.log('버블 로드 완료');
        
    } catch (error) {
        console.error('버블 로드 실패:', error);
        if (bubbles) {
            bubbles.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 2rem;">글을 불러오는데 실패했습니다.</p>';
        }
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
