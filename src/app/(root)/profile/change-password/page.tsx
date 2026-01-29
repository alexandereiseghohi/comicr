export default function ChangePasswordPage() {
  return (
    <main>
      <h1>Change Password</h1>
      <form>
        <label>
          Current password
          <input type="password" name="current" />
        </label>
        <label>
          New password
          <input type="password" name="new" />
        </label>
        <button type="submit">Change</button>
      </form>
    </main>
  );
}
