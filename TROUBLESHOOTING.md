# 문제 해결 가이드

## "저장 중 오류가 발생했습니다" 오류

### 원인
Firestore 보안 규칙이 설정되지 않았거나 잘못 설정되어 있습니다.

### 해결 방법

#### 방법 1: 올바른 보안 규칙 설정 (권장)

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 `product-2778e` 선택
3. **Firestore Database** → **규칙** 탭
4. 다음 규칙을 복사하여 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inventory/{document} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /partners/{document} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /transactions/{document} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /serials/{document} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

5. **게시** 버튼 클릭

#### 방법 2: 임시 테스트 모드 (빠른 테스트용)

개발 중 빠르게 테스트하려면 다음 규칙을 사용하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **주의**: 이 규칙은 인증된 모든 사용자가 모든 데이터에 접근할 수 있습니다!

---

## 기타 일반적인 오류

### 1. "Firebase: Error (auth/invalid-api-key)"
**원인**: API 키가 올바르지 않습니다.  
**해결**: `src/firebase.js` 파일의 `apiKey` 값을 Firebase Console에서 다시 확인하세요.

### 2. "Firebase: Error (auth/configuration-not-found)"
**원인**: Firebase Authentication이 활성화되지 않았습니다.  
**해결**: Firebase Console → Authentication → 시작하기 → 이메일/비밀번호 활성화

### 3. "Missing or insufficient permissions"
**원인**: Firestore 보안 규칙 문제  
**해결**: 위의 보안 규칙을 올바르게 설정하세요.

### 4. 브라우저 콘솔에서 오류 확인

1. 브라우저에서 F12 키를 눌러 개발자 도구 열기
2. **Console** 탭 선택
3. 빨간색 오류 메시지 확인
4. 오류 메시지를 복사하여 문제 파악

---

## 테스트 체크리스트

설정 후 다음을 테스트하세요:

- [ ] 회원가입 가능
- [ ] 로그인 가능
- [ ] 재고 등록 가능 (신규 등록 버튼)
- [ ] 재고 수정 가능 (연필 아이콘)
- [ ] 재고 삭제 가능 (휴지통 아이콘)
- [ ] 거래처 등록 가능
- [ ] 입출고 거래 등록 가능
- [ ] 데이터가 새로고침 후에도 유지됨

---

## 추가 도움이 필요한 경우

브라우저 콘솔의 오류 메시지를 확인하고 공유해주세요.
