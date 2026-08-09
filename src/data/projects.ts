// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	visitUrl?: string;
}

export const projectsData: Project[] = [
	{
		id: "booktalk",
		title: "BookTalk",
		description:
			"도서 정보를 탐색하고 리뷰로 소통하며 AI 챗봇에게 책을 추천받는 풀스택 SPA입니다. Spring Boot(REST API) · React(SPA) · Node.js/Express(게시판·외부 API 프록시) 세 서버를 분리해 구성했고, JWT HttpOnly 쿠키 인증과 소셜 로그인을 적용했습니다. 프론트엔드 저장소는 github.com/necteo/BookTalk-react 입니다.",
		image: "",
		category: "web",
		techStack: [
			"Spring Boot",
			"React 19",
			"TypeScript",
			"JPA",
			"MySQL",
			"JWT / OAuth2",
			"Node.js / Express",
			"Spring AI",
		],
		status: "completed",
		sourceCode: "https://github.com/necteo/BookTalk-spring",
		startDate: "2026-02-12",
		endDate: "2026-06-14",
		featured: true,
		tags: ["개인 프로젝트", "풀스택", "인증", "AI"],
	},
	{
		id: "allmovie",
		title: "AllMovie",
		description:
			"영화 예매와 매점 주문을 함께 처리하는 영화관 통합 플랫폼입니다. 영화 조회 · 매점 주문 · 결제(PortOne) · 재고 관리를 담당했고, 주문 현황을 폴링에서 STOMP WebSocket으로 전환해 실시간으로 전달했습니다. Jenkins와 Docker로 AWS EC2 자동 배포 파이프라인도 구성했습니다.",
		image: "",
		category: "web",
		techStack: [
			"Spring Boot",
			"MyBatis",
			"Oracle",
			"Vue.js / Pinia",
			"WebSocket(STOMP)",
			"Docker",
			"Jenkins",
			"AWS EC2",
		],
		status: "completed",
		sourceCode: "https://github.com/AllMovieProject/AllMovieProject",
		startDate: "2025-12-22",
		endDate: "2026-01-30",
		featured: true,
		tags: ["팀 프로젝트", "실시간", "결제", "CI/CD"],
	},
	{
		id: "allcamp",
		title: "AllCamp",
		description:
			"캠핑장 예약과 주변 맛집·축제 정보, 커뮤니티를 제공하는 통합 플랫폼입니다. 공지사항과 Q&A 게시판 전반을 담당했고, Oracle 계층형 쿼리(CONNECT BY)로 댓글·대댓글이 계층을 유지하며 정렬되도록 구현했습니다. DAO · Model · VO 레이어를 직접 설계했습니다.",
		image: "",
		category: "web",
		techStack: [
			"Java",
			"JSP / Servlet",
			"MyBatis",
			"Oracle",
			"jQuery / Ajax",
			"AWS EC2",
		],
		status: "completed",
		sourceCode: "https://github.com/JSPWebProject/AllCamp",
		startDate: "2025-10-13",
		endDate: "2025-11-20",
		tags: ["팀 프로젝트", "게시판", "계층형 쿼리"],
	},
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter(
		(p) => p.status === "completed",
	).length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
