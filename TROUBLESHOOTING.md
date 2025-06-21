# Troubleshooting Guide - Animato App

## 🔧 Common Issues & Solutions

### **Supabase Bundling Issues**

#### **Problem**: "Unable to resolve ./SupabaseClient" error
**Solution**: The app now includes automatic fallback authentication
- ✅ **Automatic Fallback**: If Supabase fails to load, the app uses a mock authentication system
- ✅ **No App Crash**: Authentication will work even with bundling issues
- ✅ **Development Ready**: You can develop and test without Supabase setup

#### **What happens with fallback**:
- Sign up/Sign in will work with mock data
- User sessions are stored in memory (lost on app restart)
- Console logs will show "⚠️ Supabase failed to load, using fallback auth"

### **Setting Up Real Supabase**

#### **Step 1**: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create new project
3. Get your Project URL and anon key

#### **Step 2**: Update Configuration
Edit `src/config/supabase.ts`:
```typescript
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseAnonKey = 'your-anon-key';
```

#### **Step 3**: Test Connection
- Restart the app with `npx expo start --clear`
- Look for "✅ Supabase loaded successfully" in console
- Try authentication features

### **Metro Bundler Issues**

#### **Problem**: Module resolution errors
**Solution**: 
```bash
# Clear all caches
npx expo start --clear

# If still issues, reset metro cache
npx react-native start --reset-cache
```

#### **Problem**: Crypto module errors
**Solution**: Already configured in `metro.config.js`
- Uses `expo-crypto` as crypto alias
- Package exports enabled for better compatibility

### **Authentication Testing**

#### **With Fallback (No Supabase)**:
- Any email/password combination works for sign up
- Use the same credentials to sign in
- Data is lost on app restart

#### **With Real Supabase**:
- Real email validation
- Persistent user sessions
- Email verification (if enabled)

### **Environment Variables**

#### **Optional Setup**:
Create `.env` file in project root:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### **Benefits**:
- Keep credentials secure
- Easy deployment configuration
- No code changes needed

### **Console Debugging**

#### **Look for these messages**:
- ✅ `"Supabase loaded successfully"` - Real Supabase working
- ⚠️ `"Supabase failed to load, using fallback auth"` - Using mock auth
- 📝 `"Mock sign up successful"` - Fallback auth working
- 📝 `"Mock sign in successful"` - Fallback auth working

### **Production Deployment**

#### **Before deploying**:
1. ✅ Set up real Supabase project
2. ✅ Update credentials in `src/config/supabase.ts`
3. ✅ Test authentication with real Supabase
4. ✅ Remove fallback system (optional)

#### **Security Notes**:
- Never commit real Supabase keys to version control
- Use environment variables for production
- Enable Row Level Security (RLS) in Supabase

### **Getting Help**

#### **Check Console Logs**:
- Open React Native debugger
- Look for authentication-related messages
- Check for error details

#### **Common Solutions**:
1. **Clear cache**: `npx expo start --clear`
2. **Restart Metro**: Stop and start the development server
3. **Check credentials**: Verify Supabase URL and key
4. **Network issues**: Check internet connection

#### **Still Having Issues?**
- The fallback system ensures the app always works
- Focus on UI/UX development first
 