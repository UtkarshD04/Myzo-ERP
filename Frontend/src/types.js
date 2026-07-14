// Comment structure for documentation
// @typedef {Object} Comment
// @property {string} author
// @property {string} text
// @property {string} date

// @typedef {Object} Task
// @property {string} id
// @property {string} title
// @property {string} description
// @property {'Low' | 'Medium' | 'High'} priority
// @property {string} dueDate
// @property {number} progress - 0 to 100
// @property {'To Do' | 'In Progress' | 'In Review' | 'Completed'} status
// @property {string|null} [attachment]
// @property {Comment[]} comments
// @property {'Today' | 'Weekly' | 'Monthly' | 'Yearly'} type
// @property {string} [assignedTo] - Employee ID
// @property {string} [assignedBy] - Employee ID or Name who assigned the task

// @typedef {'Sales' | 'Web Developer' | 'Finance' | 'HR' | 'Admin'} DepartmentType
// @typedef {'Employee' | 'Manager' | 'HR' | 'Admin'} UserRole

// @typedef {Object} Employee
// @property {string} id
// @property {string} name
// @property {string} photo
// @property {DepartmentType} department
// @property {string} designation
// @property {string} post
// @property {string} joiningDate
// @property {string} officialEmail
// @property {string} phone
// @property {string} reportsTo - Employee ID or Manager Name
// @property {string} [reportsToDesignation]
// @property {string[]} directReportingEmployees - List of names/IDs
// @property {'Active' | 'On Leave' | 'Suspended'} employmentStatus
// @property {UserRole} role
// @property {string} [password]
// @property {number} [salary]

// @typedef {Object} AttendanceRecord
// @property {string} date - YYYY-MM-DD
// @property {string|null} checkIn - HH:MM AM/PM
// @property {string|null} checkOut - HH:MM AM/PM
// @property {number} workingHours - decimal hours
// @property {number} overtime - decimal hours
// @property {'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave'} status
// @property {boolean} lateMark

// @typedef {Object} Holiday
// @property {string} id
// @property {string} name
// @property {string} date - YYYY-MM-DD
// @property {'National' | 'Company' | 'Department'} type
// @property {DepartmentType} [department]

// @typedef {Object} SystemNotification
// @property {string} id
// @property {string} title
// @property {string} message
// @property {string} time
// @property {boolean} read
// @property {'Task' | 'Attendance' | 'Holiday' | 'System'} category

// @typedef {Object} DepartmentKPIs
// @property {Object} [sales]
// @property {number} sales.dailyTarget
// @property {number} sales.dailyValue
// @property {number} sales.monthlyTarget
// @property {number} sales.monthlyValue
// @property {number} sales.yearlyTarget
// @property {number} sales.yearlyValue
// @property {Array<{name: string, status: string, value: number}>} sales.leads
// @property {number} sales.collections
// @property {Object} [developer]
// @property {number} developer.sprintTasksCompleted
// @property {number} developer.sprintTasksTotal
// @property {number} developer.bugsFixed
// @property {number} developer.bugsTotal
// @property {number} developer.featuresDelivered
// @property {'Pending' | 'Approved' | 'Changes Requested'} developer.codeReviewStatus
// @property {number} developer.deploymentProgress - percentage
// @property {Object} [finance]
// @property {number} finance.invoicesProcessed
// @property {number} finance.invoicesTotal
// @property {number} finance.paymentVerifications
// @property {number} finance.monthlyClosingProgress - percentage
// @property {number} finance.budgetProgress - percentage
// @property {number} finance.financialAccuracy - percentage
// @property {Object} [hr]
// @property {number} hr.interviewsScheduled
// @property {number} hr.hiringTarget
// @property {number} hr.hiringValue
// @property {number} hr.onboardingCount
// @property {number} hr.employeeEngagement - out of 10

// @typedef {Object} DailyWorkReport
// @property {string} id
// @property {string} date
// @property {string} employeeId
// @property {string} employeeName
// @property {DepartmentType} department
// @property {string} tasksCompleted
// @property {string} challengesFaced
// @property {string} nextDayPlan
// @property {number} hoursSpent
// @property {'Draft' | 'Submitted' | 'Reviewed'} status
// @property {string} [reviewComments]