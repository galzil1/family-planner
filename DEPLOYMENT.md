# מדריך העלאה לפרודקשן

## שלב 1: העלאה ל-GitHub

```bash
# ודא שאתה בתיקיית הפרויקט
cd /Users/galzi/my-projects/family-planner

# אתחל Git אם עדיין לא קיים
git init

# הוסף את כל הקבצים
git add .

# צור commit
git commit -m "Ready for production"

# צור repository חדש ב-GitHub ואז:
git remote add origin https://github.com/YOUR_USERNAME/family-planner.git
git branch -M main
git push -u origin main
```

## שלב 2: העלאה ל-Vercel

1. היכנס ל-[vercel.com](https://vercel.com) והתחבר עם GitHub
2. לחץ על "Add New Project"
3. בחר את ה-repository `family-planner`
4. **חשוב!** הוסף Environment Variables (Production, Preview, Development):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://byxajhtidgrurslvinqw.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (העתק מקובץ .env.local)
   - `SUPABASE_SERVICE_ROLE_KEY` = (העתק מ-Supabase Dashboard → Settings → API → service_role; נדרש ל-WhatsApp API)
5. לחץ "Deploy"

## שלב 3: עדכון Supabase

לאחר ש-Vercel נותן לך URL (למשל `https://family-planner-xxx.vercel.app`):

1. היכנס ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. לך ל-**Authentication** → **URL Configuration**
3. עדכן:
   - **Site URL**: `https://YOUR-APP.vercel.app`
   - **Redirect URLs**: הוסף `https://YOUR-APP.vercel.app/auth/callback`

## שלב 4: שיתוף עם בת הזוג

1. שלח לה את הלינק: `https://YOUR-APP.vercel.app`
2. היא צריכה להירשם (signup)
3. בדף ה-Onboarding, היא בוחרת "הצטרפות למשפחה קיימת"
4. היא מזינה את **קוד ההזמנה** שלך (מופיע בכותרת ליד שם המשפחה)

## שלב 5: התקנה על הנייד (PWA)

### אייפון:
1. פתח את הלינק ב-Safari
2. לחץ על כפתור השיתוף (ריבוע עם חץ)
3. בחר "Add to Home Screen"
4. לחץ "Add"

### אנדרואיד:
1. פתח את הלינק ב-Chrome
2. לחץ על שלוש הנקודות (תפריט)
3. בחר "Add to Home Screen" או "Install App"
4. לחץ "Install"

---

## יישור הפרודקשן עם main (Redeploy)

אם הקומיטים האחרונים לא עלו לפרודקשן (למשל בגלל כישלון בדפלוי):

1. **בדוק משתני סביבה ב-Vercel**  
   Vercel → הפרויקט → Settings → Environment Variables. וודא ש-Production כולל:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (מ-Supabase → Settings → API → service_role)

2. **הפעלת דפלוי מחדש**  
   Vercel → Deployments → בחר את הדפלוי האחרון (או את ה-commit הרלוונטי) → ⋮ → **Redeploy** → "Redeploy" (ללא cache אם יש בעיות).

   לחלופין: דחיפת קומיט חדש ל-`main` מפעילה דפלוי אוטומטי.

---

## פתרון בעיות

### "Failed to fetch" בזמן התחברות:
- ודא שה-Environment Variables מוגדרים נכון ב-Vercel
- ודא שה-Site URL ב-Supabase מעודכן

### בת הזוג לא מצליחה להצטרף:
- ודא שהיא מזינה את קוד ההזמנה הנכון (8 תווים)
- ודא שהיא רשומה ומאומתת (בדקה את המייל)

### האפליקציה לא מופיעה כ-PWA:
- ודא שאתם ניגשים דרך HTTPS
- נסו לרענן את הדף כמה פעמים
