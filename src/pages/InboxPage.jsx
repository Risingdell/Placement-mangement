function InboxPage() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Inbox</h2>
        <p style={styles.subtitle}>Messages and notifications from placement office</p>
      </div>

      <div style={styles.comingSoon}>
        <span style={styles.icon}>📬</span>
        <h3>Coming Soon</h3>
        <p>View messages about drives, shortlists, and updates</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    margin: 0,
  },
  comingSoon: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  icon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '20px',
  },
};

export default InboxPage;
