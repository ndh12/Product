# Firestore 보안 규칙 설정

Firebase Console → Firestore Database → 규칙 탭에서 다음 규칙을 복사하여 붙여넣으세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 접근 가능
    match /inventory/{document} {
      // 읽기: 자신의 데이터만
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      // 생성: 인증된 사용자, userId 필드 필수
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      // 수정/삭제: 자신의 데이터만
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    match /partners/{document} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    match /transactions/{document} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    match /serials/{document} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
  }
}
```

## 규칙 적용 방법

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 `product-2778e` 선택
3. 왼쪽 메뉴에서 **Firestore Database** 클릭
4. 상단 탭에서 **규칙** 클릭
5. 위의 규칙 전체를 복사하여 붙여넣기
6. **게시** 버튼 클릭

## 중요 사항

- `resource.data`: 기존 문서의 데이터 (읽기/수정/삭제 시)
- `request.resource.data`: 새로 생성/수정할 데이터 (생성/수정 시)
- 생성 시에는 `request.resource.data.userId`를 체크해야 합니다

## 테스트 모드 (임시 해결책)

만약 위 규칙이 복잡하다면, 개발 중에는 임시로 테스트 모드를 사용할 수 있습니다:

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

⚠️ **주의**: 테스트 모드는 인증된 모든 사용자가 모든 데이터에 접근할 수 있습니다. 프로덕션에서는 사용하지 마세요!
