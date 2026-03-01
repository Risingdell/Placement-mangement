const { promisePool: db } = require('../config/database');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Overall stats
    const [overallStats] = await db.query(`
      SELECT
        COUNT(DISTINCT u.id) as total_students,
        SUM(u.is_placed) as placed_students,
        COUNT(DISTINCT CASE WHEN sa.cgpa >= 6.0 AND sa.backlogs = 0 THEN u.id END) as eligible_students,
        COUNT(DISTINCT pd.id) as total_drives,
        COUNT(DISTINCT c.id) as total_companies,
        COUNT(DISTINCT a.id) as total_applications,
        AVG(CASE WHEN u.is_placed THEN pd.ctc END) as avg_ctc,
        MAX(CASE WHEN u.is_placed THEN pd.ctc END) as highest_ctc
      FROM users u
      LEFT JOIN student_academics sa ON u.id = sa.user_id
      LEFT JOIN applications a ON u.id = a.user_id
      LEFT JOIN placement_drives pd ON a.drive_id = pd.id AND a.status = 'Selected'
      LEFT JOIN companies c ON pd.company_id = c.id
      WHERE u.role = 'student'
    `);

    // Recent placements
    const [recentPlacements] = await db.query(`
      SELECT
        u.name as student_name, u.usn,
        pd.name as company_name, pd.role, pd.ctc,
        a.updated_at as placement_date
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN placement_drives pd ON a.drive_id = pd.id
      WHERE a.status = 'Selected'
      ORDER BY a.updated_at DESC
      LIMIT 5
    `);

    // Pending verifications
    const [pendingVerifications] = await db.query(`
      SELECT COUNT(*) as count FROM document_verifications WHERE status = 'Pending'
    `);

    // Pending profile changes
    const [pendingChanges] = await db.query(`
      SELECT COUNT(*) as count FROM profile_change_requests WHERE status = 'Pending'
    `);

    res.json({
      success: true,
      data: {
        overall: overallStats[0],
        recentPlacements,
        pendingVerifications: pendingVerifications[0].count,
        pendingProfileChanges: pendingChanges[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Get placement statistics over time
exports.getPlacementStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT * FROM placement_statistics
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ` AND stat_date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND stat_date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY stat_date DESC`;

    const [stats] = await db.query(query, params);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching placement statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching placement statistics',
      error: error.message
    });
  }
};

// Get branch-wise statistics
exports.getBranchWiseStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT
        sa.branch,
        COUNT(DISTINCT u.id) as total_students,
        SUM(u.is_placed) as placed_students,
        ROUND((SUM(u.is_placed) / COUNT(DISTINCT u.id)) * 100, 2) as placement_percentage,
        AVG(sa.cgpa) as avg_cgpa,
        AVG(CASE WHEN u.is_placed THEN pd.ctc END) as avg_ctc,
        MAX(CASE WHEN u.is_placed THEN pd.ctc END) as highest_ctc
      FROM users u
      JOIN student_academics sa ON u.id = sa.user_id
      LEFT JOIN applications a ON u.id = a.user_id AND a.status = 'Selected'
      LEFT JOIN placement_drives pd ON a.drive_id = pd.id
      WHERE u.role = 'student'
      GROUP BY sa.branch
      ORDER BY placement_percentage DESC
    `);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching branch-wise stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching branch-wise statistics',
      error: error.message
    });
  }
};

// Get company-wise statistics
exports.getCompanyWiseStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT
        pd.name as company_name,
        pd.company_type,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'Shortlisted' THEN a.id END) as shortlisted,
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN a.id END) as selected,
        ROUND((COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN a.id END) /
               COUNT(DISTINCT a.id)) * 100, 2) as selection_rate,
        AVG(pd.ctc) as avg_ctc,
        MAX(pd.ctc) as highest_ctc
      FROM placement_drives pd
      LEFT JOIN applications a ON pd.id = a.drive_id
      GROUP BY pd.name, pd.company_type
      HAVING total_applications > 0
      ORDER BY selected DESC
    `);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching company-wise stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company-wise statistics',
      error: error.message
    });
  }
};

// Get salary analysis
exports.getSalaryAnalysis = async (req, res) => {
  try {
    // CTC distribution
    const [ctcDistribution] = await db.query(`
      SELECT
        CASE
          WHEN pd.ctc < 4 THEN '< 4 LPA'
          WHEN pd.ctc >= 4 AND pd.ctc < 7 THEN '4-7 LPA'
          WHEN pd.ctc >= 7 AND pd.ctc < 10 THEN '7-10 LPA'
          WHEN pd.ctc >= 10 AND pd.ctc < 15 THEN '10-15 LPA'
          ELSE '15+ LPA'
        END as ctc_range,
        COUNT(*) as student_count
      FROM applications a
      JOIN placement_drives pd ON a.drive_id = pd.id
      WHERE a.status = 'Selected'
      GROUP BY ctc_range
      ORDER BY MIN(pd.ctc)
    `);

    // Overall salary stats
    const [salaryStats] = await db.query(`
      SELECT
        COUNT(*) as total_offers,
        AVG(pd.ctc) as avg_ctc,
        MAX(pd.ctc) as highest_ctc,
        MIN(pd.ctc) as lowest_ctc,
        STDDEV(pd.ctc) as ctc_stddev
      FROM applications a
      JOIN placement_drives pd ON a.drive_id = pd.id
      WHERE a.status = 'Selected'
    `);

    // Branch-wise salary
    const [branchSalary] = await db.query(`
      SELECT
        sa.branch,
        AVG(pd.ctc) as avg_ctc,
        MAX(pd.ctc) as max_ctc,
        MIN(pd.ctc) as min_ctc
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN student_academics sa ON u.id = sa.user_id
      JOIN placement_drives pd ON a.drive_id = pd.id
      WHERE a.status = 'Selected'
      GROUP BY sa.branch
    `);

    res.json({
      success: true,
      data: {
        ctcDistribution,
        overallStats: salaryStats[0],
        branchWise: branchSalary
      }
    });
  } catch (error) {
    console.error('Error fetching salary analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching salary analysis',
      error: error.message
    });
  }
};

// Get application trends
exports.getApplicationTrends = async (req, res) => {
  try {
    // Applications over time
    const [applicationTrends] = await db.query(`
      SELECT
        DATE(applied_at) as date,
        COUNT(*) as application_count,
        COUNT(DISTINCT user_id) as unique_applicants,
        COUNT(CASE WHEN status = 'Selected' THEN 1 END) as selections
      FROM applications
      WHERE applied_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(applied_at)
      ORDER BY date DESC
    `);

    // Popular companies
    const [popularCompanies] = await db.query(`
      SELECT
        pd.name as company_name,
        COUNT(*) as application_count
      FROM applications a
      JOIN placement_drives pd ON a.drive_id = pd.id
      GROUP BY pd.name
      ORDER BY application_count DESC
      LIMIT 10
    `);

    // Application status breakdown
    const [statusBreakdown] = await db.query(`
      SELECT
        status,
        COUNT(*) as count,
        ROUND((COUNT(*) / (SELECT COUNT(*) FROM applications)) * 100, 2) as percentage
      FROM applications
      GROUP BY status
    `);

    res.json({
      success: true,
      data: {
        trends: applicationTrends,
        popularCompanies,
        statusBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching application trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application trends',
      error: error.message
    });
  }
};

// Export report
exports.exportReport = async (req, res) => {
  try {
    const { reportType, filters, format = 'CSV' } = req.body;

    let data = [];
    let fileName = '';

    switch (reportType) {
      case 'placement':
        [data] = await db.query(`
          SELECT
            u.usn, u.name, u.email, u.phone,
            sa.cgpa, sa.branch, sa.year,
            pd.name as company, pd.role, pd.ctc,
            a.applied_at, a.updated_at as selected_at
          FROM applications a
          JOIN users u ON a.user_id = u.id
          JOIN student_academics sa ON u.id = sa.user_id
          JOIN placement_drives pd ON a.drive_id = pd.id
          WHERE a.status = 'Selected'
          ORDER BY a.updated_at DESC
        `);
        fileName = 'placement_report';
        break;

      case 'branch_wise':
        [data] = await this.getBranchWiseStats(req, res);
        fileName = 'branch_wise_report';
        break;

      case 'company_wise':
        [data] = await this.getCompanyWiseStats(req, res);
        fileName = 'company_wise_report';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    // Log export
    await db.query(
      `INSERT INTO export_logs (
        export_type, export_format, filter_criteria,
        file_name, record_count, exported_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [reportType, format, JSON.stringify(filters),
       `${fileName}_${Date.now()}.${format.toLowerCase()}`,
       data.length, req.user.id]
    );

    // Log admin action
    await db.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, description, created_at
      ) VALUES (?, 'Export', 'Report', ?, NOW())`,
      [req.user.id, `Exported ${reportType} report with ${data.length} records`]
    );

    res.json({
      success: true,
      message: 'Report exported successfully',
      data,
      fileName: `${fileName}_${Date.now()}.${format.toLowerCase()}`
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting report',
      error: error.message
    });
  }
};
