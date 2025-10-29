// Firebase 설정
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

// Firebase 설정 객체 (실제 값으로 교체해야 합니다)
const firebaseConfig = {
  apiKey: "AIzaSyDIVQzOdsJOlQAn52YQGbQpMZKuPHkfD9I", // 실제 API 키로 교체
  authDomain: "depression-c5bf2.firebaseapp.com", // 실제 도메인으로 교체
  projectId: "depression-c5bf2", // 실제 프로젝트 ID로 교체
  storageBucket: "depression-c5bf2.firebasestorage.app", // 실제 스토리지 버킷으로 교체
  messagingSenderId: "563591628277", // 실제 메시징 ID로 교체
  appId: "1:563591628277:web:b0a5c074c044bf4da60cbc", // 실제 앱 ID로 교체
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore 컬렉션 참조
export const notesCollection = collection(db, "notes");

// Firestore 함수들
export const firestore = {
  // 새 글 저장
  async saveNote(content) {
    try {
      console.log("Firestore에 글 저장 시작:", content);
      console.log("컬렉션 참조:", notesCollection);

      const noteData = {
        content: content,
        createdAt: new Date(),
        reactions: {
          smile: 0,
          sad: 0,
          neutral: 0,
          thought: 0,
          heart: 0,
        },
        deleted: false,
      };

      console.log("저장할 데이터:", noteData);

      const docRef = await addDoc(notesCollection, noteData);
      console.log("저장 성공! 문서 ID:", docRef.id);

      return docRef.id;
    } catch (error) {
      console.error("글 저장 오류:", error);
      console.error("오류 상세:", error.message);
      console.error("오류 코드:", error.code);
      throw error;
    }
  },

  // 글 ID로 글 가져오기
  async getNoteById(noteId) {
    try {
      const q = query(notesCollection, where("__name__", "==", noteId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("글 가져오기 오류:", error);
      throw error;
    }
  },

  // 공개 피드용 글들 가져오기
  async getPublicNotes(limitCount = 20) {
    try {
      console.log("Firestore에서 글 가져오기 시작...");

      // 인덱스 문제를 피하기 위해 간단한 쿼리만 사용
      console.log("간단한 쿼리로 모든 글 가져오기...");
      const simpleQuery = query(
        notesCollection,
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const simpleSnapshot = await getDocs(simpleQuery);
      console.log("가져온 글 개수:", simpleSnapshot.docs.length, "개");

      // 클라이언트에서 deleted 필드 필터링
      const notes = simpleSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((note) => note.deleted !== true); // deleted가 true가 아닌 것만 필터링

      console.log("필터링 후 글 개수:", notes.length, "개");
      console.log("최종 결과:", notes);
      return notes;
    } catch (error) {
      console.error("공개 글 가져오기 오류:", error);
      console.error("오류 상세:", error.message);
      console.error("오류 코드:", error.code);

      // 오류가 발생해도 빈 배열 반환하여 앱이 중단되지 않도록
      return [];
    }
  },

  // 반응 추가
  async addReaction(noteId, reactionType) {
    try {
      const noteRef = doc(db, "notes", noteId);
      await updateDoc(noteRef, {
        [`reactions.${reactionType}`]: increment(1),
      });
    } catch (error) {
      console.error("반응 추가 오류:", error);
      throw error;
    }
  },
};

export default db;
