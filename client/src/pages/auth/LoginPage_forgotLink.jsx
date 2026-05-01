// ADD this link to your LoginPage.jsx, just below the password input field
// Find the password form-group and add after it:

{/* Forgot password link — add this between password input and submit button */}
<div className="flex justify-end -mt-2">
  <Link
    to="/forgot-password"
    className="font-sans text-xs text-gold-600 hover:text-gold-700 transition-colors font-medium"
  >
    Forgot password?
  </Link>
</div>
