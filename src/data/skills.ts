// Skill data configuration file
// Used to manage data for the skill display page

export interface Skill {
	id: string;
	name: string;
	description: string;
	icon: string; // Iconify icon name
	category: 'frontend' | 'backend' | 'database' | 'tools' | 'other';
	level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
	experience: {
		years: number;
		months: number;
	};
	projects?: string[]; // Related project IDs
	certifications?: string[];
	color?: string; // Skill card theme color
}

export const skillsData: Skill[] = [
	// Frontend Skills
	{
		id: 'javascript',
		name: 'JavaScript',
		description:
			'Modern JavaScript development, including ES6+ syntax, asynchronous programming, and modular development.',
		icon: 'logos:javascript',
		category: 'frontend',
		level: 'beginner',
		experience: { years: 3, months: 6 },
		projects: ['mizuki-blog', 'portfolio-website', 'data-visualization-tool'],
		color: '#F7DF1E',
	},
	{
		id: 'typescript',
		name: 'TypeScript',
		description:
			'A type-safe superset of JavaScript that enhances code quality and development efficiency.',
		icon: 'logos:typescript-icon',
		category: 'frontend',
		level: 'beginner',
		experience: { years: 2, months: 8 },
		projects: ['mizuki-blog', 'portfolio-website', 'task-manager-app'],
		color: '#3178C6',
	},
	{
		id: 'react',
		name: 'React',
		description:
			'A JavaScript library for building user interfaces, including Hooks, Context, and state management.',
		icon: 'logos:react',
		category: 'frontend',
		level: 'beginner',
		experience: { years: 2, months: 10 },
		projects: ['portfolio-website', 'task-manager-app'],
		color: '#61DAFB',
	},
	{
		id: 'vue',
		name: 'Vue.js',
		description:
			'A progressive JavaScript framework that is easy to learn and use, suitable for rapid development.',
		icon: 'logos:vue',
		category: 'frontend',
		level: 'beginner',
		experience: { years: 1, months: 8 },
		projects: ['data-visualization-tool'],
		color: '#4FC08D',
	},
	{
		id: 'astro',
		name: 'Astro',
		description:
			'A modern static site generator supporting multi-framework integration and excellent performance.',
		icon: 'logos:astro-icon',
		category: 'frontend',
		level: 'beginner',
		experience: { years: 1, months: 2 },
		projects: ['mizuki-blog'],
		color: '#FF5D01',
	},

	// Backend Skills
	{
		id: 'nodejs',
		name: 'Node.js',
		description:
			'A JavaScript runtime based on Chrome V8 engine, used for server-side development.',
		icon: 'logos:nodejs-icon',
		category: 'backend',
		level: 'beginner',
		experience: { years: 2, months: 3 },
		projects: ['data-visualization-tool', 'e-commerce-platform'],
		color: '#339933',
	},
	{
		id: 'java',
		name: 'Java',
		description:
			'A mainstream programming language for enterprise application development, cross-platform and object-oriented.',
		icon: 'logos:java',
		category: 'backend',
		level: 'beginner',
		experience: { years: 2, months: 0 },
		projects: ['enterprise-system', 'microservices-api'],
		color: '#ED8B00',
	},
	{
		id: 'cpp',
		name: 'C++',
		description:
			'A high-performance systems programming language widely used in game development, system software, and embedded development.',
		icon: 'logos:c-plusplus',
		category: 'backend',
		level: 'beginner',
		experience: { years: 1, months: 4 },
		projects: ['game-engine', 'system-optimization'],
		color: '#00599C',
	},
	{
		id: 'c',
		name: 'C',
		description:
			'A low-level systems programming language, the foundation for operating systems and embedded systems development.',
		icon: 'logos:c',
		category: 'backend',
		level: 'beginner',
		experience: { years: 1, months: 2 },
		projects: ['embedded-system', 'kernel-module'],
		color: '#A8B9CC',
	},
	{
		id: 'kotlin',
		name: 'Kotlin',
		description:
			'A modern programming language developed by JetBrains, fully compatible with Java, the preferred choice for Android development.',
		icon: 'logos:kotlin-icon',
		category: 'backend',
		level: 'beginner',
		experience: { years: 0, months: 8 },
		projects: ['android-app', 'kotlin-backend'],
		color: '#7F52FF',
	},
	{
		id: 'express',
		name: 'Express.js',
		description: 'A fast, minimalist Node.js web application framework.',
		icon: 'simple-icons:express',
		category: 'backend',
		level: 'beginner',
		experience: { years: 1, months: 8 },
		projects: ['data-visualization-tool'],
		color: '#616161', // 更改为深灰色，避免纯黑色
	},
	{
		id: 'spring',
		name: 'Spring Boot',
		description:
			'The most popular enterprise application development framework in the Java ecosystem.',
		icon: 'logos:spring-icon',
		category: 'backend',
		level: 'beginner',
		experience: { years: 1, months: 4 },
		projects: ['enterprise-system', 'rest-api'],
		color: '#6DB33F',
	},

	// Database Skills
	{
		id: 'oracle',
		name: 'Oracle DataBase',
		description:
			"The world's most popular open-source relational database management system, widely used in web applications.",
		icon: 'logos:oracle',
		category: 'database',
		level: 'beginner',
		experience: { years: 2, months: 6 },
		projects: ['e-commerce-platform', 'blog-system'],
		color: '#c73232',
	},
	{
		id: 'mysql',
		name: 'MySQL',
		description:
			"The world's most popular open-source relational database management system, widely used in web applications.",
		icon: 'logos:mysql-icon',
		category: 'database',
		level: 'beginner',
		experience: { years: 2, months: 6 },
		projects: ['e-commerce-platform', 'blog-system'],
		color: '#4479A1',
	},
	{
		id: 'mongodb',
		name: 'MongoDB',
		description:
			'A document-oriented NoSQL database with a flexible data model.',
		icon: 'logos:mongodb-icon',
		category: 'database',
		level: 'beginner',
		experience: { years: 1, months: 2 },
		color: '#47A248',
	},

	// Tools
	{
		id: 'git',
		name: 'Git',
		description:
			'A distributed version control system, an essential tool for code management and team collaboration.',
		icon: 'logos:git-icon',
		category: 'tools',
		level: 'beginner',
		experience: { years: 3, months: 0 },
		color: '#F05032',
	},
	{
		id: 'vscode',
		name: 'VS Code',
		description:
			'A lightweight but powerful code editor with a rich plugin ecosystem.',
		icon: 'logos:visual-studio-code',
		category: 'tools',
		level: 'beginner',
		experience: { years: 3, months: 6 },
		color: '#007ACC',
	},
	{
		id: 'webstorm',
		name: 'WebStorm',
		description:
			'A professional JavaScript and web development IDE developed by JetBrains with intelligent code assistance.',
		icon: 'logos:webstorm',
		category: 'tools',
		level: 'beginner',
		experience: { years: 2, months: 0 },
		projects: ['react-project', 'vue-project'],
		color: '#00CDD7',
	},
	{
		id: 'eclipse',
		name: 'Eclipse IDEA',
		description:
			'JetBrains flagship IDE, the preferred tool for Java development with powerful intelligent coding assistance.',
		icon: 'logos:eclipse-icon',
		category: 'tools',
		level: 'intermediate',
		experience: { years: 1, months: 8 },
		projects: ['java-enterprise', 'spring-boot-app'],
		color: '#331d57',
	},
	{
		id: 'intellij',
		name: 'IntelliJ IDEA',
		description:
			'JetBrains flagship IDE, the preferred tool for Java development with powerful intelligent coding assistance.',
		icon: 'logos:intellij-idea',
		category: 'tools',
		level: 'beginner',
		experience: { years: 1, months: 8 },
		projects: ['java-enterprise', 'spring-boot-app'],
		color: '#616161', // 更改为深灰色，避免纯黑色
	},
	{
		id: 'pycharm',
		name: 'PyCharm',
		description:
			'A professional Python IDE by JetBrains providing intelligent code analysis and debugging features.',
		icon: 'logos:pycharm',
		category: 'tools',
		level: 'beginner',
		experience: { years: 1, months: 4 },
		projects: ['python-web-app', 'data-analysis'],
		color: '#21D789',
	},
	{
		id: 'docker',
		name: 'Docker',
		description:
			'A containerization platform that simplifies application deployment and environment management.',
		icon: 'logos:docker-icon',
		category: 'tools',
		level: 'beginner',
		experience: { years: 1, months: 0 },
		color: '#2496ED',
	},
	{
		id: 'kubernetes',
		name: 'Kubernetes',
		description:
			'A container orchestration platform for automating deployment, scaling, and management of containerized applications.',
		icon: 'logos:kubernetes',
		category: 'tools',
		level: 'beginner',
		experience: { years: 0, months: 4 },
		projects: ['microservices-deployment'],
		color: '#326CE5',
	},
	{
		id: 'nginx',
		name: 'Nginx',
		description: 'A high-performance web server and reverse proxy server.',
		icon: 'logos:nginx',
		category: 'tools',
		level: 'beginner',
		experience: { years: 1, months: 2 },
		projects: ['web-server-config', 'load-balancer'],
		color: '#009639',
	},
	{
		id: 'tomcat',
		name: 'Apache Tomcat',
		description:
			'A Java Servlet container and web server, the standard deployment environment for Java web applications.',
		icon: 'logos:tomcat',
		category: 'tools',
		level: 'beginner',
		experience: { years: 1, months: 4 },
		projects: ['java-web-app', 'servlet-container'],
		color: '#F8DC75',
	},
	{
		id: 'aws',
		name: 'AWS',
		description:
			"Amazon's cloud platform providing comprehensive cloud computing solutions.",
		icon: 'logos:aws',
		category: 'tools',
		level: 'beginner',
		experience: { years: 1, months: 0 },
		projects: ['cloud-deployment', 'serverless-app'],
		color: '#FF9900',
	},
	{
		id: 'linux',
		name: 'Linux',
		description:
			'An open-source operating system, the preferred choice for server deployment and development environments.',
		icon: 'logos:linux-tux',
		category: 'tools',
		level: 'beginner',
		experience: { years: 2, months: 0 },
		projects: ['server-management', 'shell-scripting'],
		color: '#FCC624',
	},
	{
		id: 'postman',
		name: 'Postman',
		description:
			'An API development and testing tool that simplifies API design, testing, and documentation.',
		icon: 'logos:postman-icon',
		category: 'tools',
		level: 'beginner',
		experience: { years: 1, months: 8 },
		projects: ['api-testing', 'api-documentation'],
		color: '#FF6C37',
	},
];

// Get skill statistics
export const getSkillStats = () => {
	const total = skillsData.length;
	const byLevel = {
		beginner: skillsData.filter((s) => s.level === 'beginner').length,
		intermediate: skillsData.filter((s) => s.level === 'intermediate').length,
		advanced: skillsData.filter((s) => s.level === 'advanced').length,
		expert: skillsData.filter((s) => s.level === 'expert').length,
	};
	const byCategory = {
		frontend: skillsData.filter((s) => s.category === 'frontend').length,
		backend: skillsData.filter((s) => s.category === 'backend').length,
		database: skillsData.filter((s) => s.category === 'database').length,
		tools: skillsData.filter((s) => s.category === 'tools').length,
		other: skillsData.filter((s) => s.category === 'other').length,
	};

	return { total, byLevel, byCategory };
};

// Get skills by category
export const getSkillsByCategory = (category?: string) => {
	if (!category || category === 'all') {
		return skillsData;
	}
	return skillsData.filter((s) => s.category === category);
};

// Get advanced skills
export const getAdvancedSkills = () => {
	return skillsData.filter(
		(s) => s.level === 'advanced' || s.level === 'expert',
	);
};

// Calculate total years of experience
export const getTotalExperience = () => {
	const totalMonths = skillsData.reduce((total, skill) => {
		return total + skill.experience.years * 12 + skill.experience.months;
	}, 0);
	return {
		years: Math.floor(totalMonths / 12),
		months: totalMonths % 12,
	};
};
