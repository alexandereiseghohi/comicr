export default function SettingsPage() {
  return (
    <main>
      <h1>Settings</h1>
      <form>
        <label>
          Receive emails
          <input type="checkbox" name="emails" />
        </label>
        <button type="submit">Save</button>
      </form>
    </main>
  );
}
