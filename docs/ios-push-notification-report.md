# iOS Push Notification Logic Report

## 1. Native iOS (AppDelegate.swift)

| Adım | Fayl | Status | Qeyd |
|------|------|--------|------|
| Firebase init | `AppDelegate.swift:12` | ✅ | `FirebaseApp.configure()` |
| UNUserNotificationCenter delegate | `AppDelegate.swift:13` | ✅ | Foreground-da banner/sound/badge göstərmək üçün |
| Messaging delegate | `AppDelegate.swift:14` | ✅ | FCM token almaq üçün |
| APNs registration | `AppDelegate.swift:15` | ✅ | `application.registerForRemoteNotifications()` |
| APNs token → FCM | `AppDelegate.swift:24-26` | ✅ | `Messaging.messaging().apnsToken = deviceToken` |
| Foreground presentation | `AppDelegate.swift:28-30` | ✅ | `.banner`, `.sound`, `.badge` |
| FCM token callback | `AppDelegate.swift:32-36` | ✅ | `NotificationCenter.post(.fcmTokenReceived)` |

**Qeyd:** `@react-native-firebase/messaging` native tərəfdə `fcmTokenReceived` event-ini dinləyir və JS-ə token ötürür. Bu standart Firebase Messaging flow-dur.

---

## 2. Info.plist & Entitlements

| Konfiqurasiya | Fayl | Status |
|---------------|------|--------|
| Background Modes | `Info.plist:71-76` | ✅ `remote-notification` |
| Push capability | `emanatt.entitlements` | ✅ `aps-environment: development` |

**⚠️ Production üçün:** `aps-environment` production-da `production` olmalıdır. Xcode-da scheme və build configuration-a görə dəyişə bilər.

---

## 3. React Native Flow

### 3.1 App başlanğıcı (`App.tsx`)

```
App mount → usePushNotifications({ requestPermissionOnMount: true })
         → onTokenReceived → registerDeviceWithBackend(token)
```

- `requestPermissionOnMount: true` → ilk mount-da icazə soruşulur
- Token alınanda avtomatik backend-ə göndərilir

### 3.2 usePushNotifications (`hooks/usePushNotifications.ts`)

| Funksiya | Məqsəd |
|----------|--------|
| `requestPermission()` | iOS: `messaging().requestPermission()` |
| `getToken()` | `messaging().getToken()` |
| Foreground listener | `messaging().onMessage()` |
| Token refresh listener | `messaging().onTokenRefresh()` |

### 3.3 NotificationService (`src/services/notificationService.ts`)

| Metod | iOS davranışı |
|-------|----------------|
| `requestPermission()` | `messaging().requestPermission()` → AUTHORIZED və ya PROVISIONAL |
| `getToken()` | Əvvəlcə icazə yoxlanır, sonra `messaging().getToken()` |
| `setupForegroundListener` | `messaging().onMessage()` |
| `setupTokenRefreshListener` | `messaging().onTokenRefresh()` |

### 3.4 Background handler (`index.js`)

```javascript
messaging().setBackgroundMessageHandler(async remoteMessage => { ... });
```

- App background və ya quit olanda gələn mesajlar üçün
- **Vacib:** Bu funksiya `index.js`-də, `AppRegistry.registerComponent`-dən **əvvəl** çağrılmalıdır ✅

---

## 4. Backend registration

| Addım | Fayl | Status |
|-------|------|--------|
| Token alınır | `usePushNotifications` / `NotificationService` | ✅ |
| Backend-ə göndərilir | `registerDeviceWithBackend()` | ✅ |
| Endpoint | `POST /mobile/Device/Register` | ✅ |
| Payload | `{ deviceId, fcmToken, platform }` | ✅ |

**Şərt:** `userToken` (AsyncStorage) olmalıdır. Login olmadan registration skip edilir.

---

## 5. Login sonrası re-registration

`LoginScreen.tsx:96-98` – login uğurlu olanda:

```javascript
const fcmToken = await NotificationService.getToken();
if (fcmToken) await registerDeviceWithBackend(fcmToken);
```

Bu, login olmadan əvvəl token alınsa belə, login sonrası device-ı backend-ə qeyd etmək üçün lazımdır.

---

## 6. Debug log-lar (__DEV__)

Aşağıdakı log-lar yalnız development-da görünür:

| Log prefix | Məna |
|------------|------|
| `[PushNotifications] requestPermission: ios authStatus=` | Icazə statusu |
| `[PushNotifications] getToken: platform= ios` | Token sorğusu |
| `[PushNotifications] getToken: success` | Token alındı |
| `[PushNotifications] foreground message received` | Foreground mesaj |
| `[PushNotifications] token refreshed` | Token yeniləndi |
| `[DeviceRegistration] Skipped: no userToken` | Login olmadan skip |
| `[DeviceRegistration] Success` | Backend registration uğurlu |
| `[DeviceRegistration] Failed` | Backend xətası |

---

## 7. Yoxlama checklist

| # | Yoxlama | Necə |
|---|---------|------|
| 1 | APNs certificate/key | Firebase Console → Project Settings → Cloud Messaging → APNs |
| 2 | Bundle ID uyğunluğu | Firebase `com.emanat.az` = Xcode bundle identifier |
| 3 | Physical device | Simulator push dəstəkləmir |
| 4 | Development vs Production | Debug build → `aps-environment: development` |
| 5 | User login | Token backend-ə göndərilməsi üçün login lazımdır |
| 6 | Console log-lar | Metro-da `FCM TOKEN:` və `[DeviceRegistration]` axtar |

---

## 8. Potensial problemlər

| Problem | Səbəb | Həll |
|---------|-------|------|
| Token alınmır | Icazə verilməyib, APNs konfiqurasiyası | Firebase APNs key/cert yoxla |
| Backend-ə getmir | `userToken` yoxdur | Login et, sonra token alınacaq |
| Foreground-da göstərilmir | `willPresent` completionHandler | Artıq `.banner, .sound, .badge` var ✅ |
| Background-da göstərilmir | Sistem notification | Data-only mesajlarda `content-available` və notification payload lazımdır |

---

## 9. Test üçün

1. Real iOS cihazda run et
2. Login ol
3. Metro console-da `FCM TOKEN:` və `[DeviceRegistration] Success` görməlisən
4. Firebase Console → Cloud Messaging ilə test notification göndər
5. App foreground, background və quit vəziyyətlərində test et
