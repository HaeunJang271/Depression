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
  apiKey: "AIzaSy...", // 실제 API 키로 교체
  authDomain: "your-project.firebaseapp.com", // 실제 도메인으로 교체
  projectId: "your-project-id", // 실제 프로젝트 ID로 교체
  storageBucket: "your-project.appspot.com", // 실제 스토리지 버킷으로 교체
  messagingSenderId: "123456789", // 실제 메시징 ID로 교체
  appId: "1:123456789:web:abcdef...", // 실제 앱 ID로 교체
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
      const docRef = await addDoc(notesCollection, {
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
      });
      return docRef.id;
    } catch (error) {
      console.error("글 저장 오류:", error);
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
      const q = query(
        notesCollection,
        where("deleted", "==", false),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("공개 글 가져오기 오류:", error);
      throw error;
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
