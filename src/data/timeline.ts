// Timeline data configuration file
// Used to manage data for the timeline page

export interface TimelineItem {
	id: string;
	title: string;
	description: string;
	type: "education" | "work" | "project" | "achievement";
	startDate: string;
	endDate?: string; // If empty, it means current
	location?: string;
	organization?: string;
	position?: string;
	skills?: string[];
	achievements?: string[];
	links?: {
		name: string;
		url: string;
		type: "website" | "certificate" | "project" | "other";
	}[];
	icon?: string; // Iconify icon name
	color?: string;
	featured?: boolean;
}

export const timelineData: TimelineItem[] = [
	{
		id: "booktalk",
		title: "BookTalk 개인 프로젝트",
		description:
			"Spring Boot · React · Express를 분리 구성한 풀스택 SPA를 기획부터 개발까지 혼자 진행했습니다.",
		type: "project",
		startDate: "2026-02-12",
		endDate: "2026-06-14",
		skills: [
			"Spring Boot",
			"React",
			"TypeScript",
			"JPA",
			"MySQL",
			"JWT / OAuth2",
		],
		achievements: [
			"JWT HttpOnly 쿠키 인증과 Google · Kakao · Naver 소셜 로그인 연동",
			"외부 API 호출을 Express 프록시로 옮겨 API 키를 서버에서만 관리",
			"리뷰 API의 작성자·소유권 검증을 JWT 기반으로 보완",
		],
		links: [
			{
				name: "Backend Repository",
				url: "https://github.com/necteo/BookTalk-spring",
				type: "project",
			},
			{
				name: "Frontend Repository",
				url: "https://github.com/necteo/BookTalk-react",
				type: "project",
			},
		],
		icon: "material-symbols:code",
		color: "#7C3AED",
		featured: true,
	},
	{
		id: "allmovie",
		title: "AllMovie 팀 프로젝트",
		description:
			"영화 예매와 매점 주문을 함께 처리하는 플랫폼에서 영화 조회 · 매점 · 결제 · 실시간 통신 · CI/CD를 담당했습니다.",
		type: "project",
		startDate: "2025-12-22",
		endDate: "2026-01-30",
		skills: [
			"Spring Boot",
			"MyBatis",
			"Oracle",
			"WebSocket(STOMP)",
			"Docker",
			"Jenkins",
		],
		achievements: [
			"주문 현황을 폴링에서 STOMP WebSocket으로 전환해 불필요한 요청 제거",
			"단품 · 콤보 상품과 옵션 구조를 정규화해 가격이 동적으로 계산되도록 설계",
			"Jenkins와 Docker로 AWS EC2 자동 배포 파이프라인 구성",
		],
		links: [
			{
				name: "GitHub Repository",
				url: "https://github.com/AllMovieProject/AllMovieProject",
				type: "project",
			},
		],
		icon: "material-symbols:movie",
		color: "#DC2626",
		featured: true,
	},
	{
		id: "allcamp",
		title: "AllCamp 팀 프로젝트",
		description:
			"캠핑 정보와 커뮤니티를 제공하는 플랫폼에서 공지사항과 Q&A 게시판 전반을 담당했습니다.",
		type: "project",
		startDate: "2025-10-13",
		endDate: "2025-11-20",
		skills: ["Java", "JSP / Servlet", "MyBatis", "Oracle", "jQuery / Ajax"],
		achievements: [
			"Oracle 계층형 쿼리(CONNECT BY)로 댓글 · 대댓글 계층 정렬 구현",
			"DAO · Model · VO 레이어를 직접 설계하고 구현",
			"AWS EC2에 Tomcat을 구성해 프로젝트 배포",
		],
		links: [
			{
				name: "GitHub Repository",
				url: "https://github.com/JSPWebProject/AllCamp",
				type: "project",
			},
		],
		icon: "material-symbols:forum",
		color: "#059669",
	},
	{
		id: "bootcamp",
		title: "AWS & CI/CD 기반 JAVA 클라우드 Full-Stack 개발자 양성과정",
		description:
			"쌍용강북교육센터에서 1,120시간 과정을 이수하며 백엔드부터 배포까지 전반을 학습했습니다.",
		type: "education",
		startDate: "2025-07-21",
		endDate: "2026-02-19",
		location: "서울",
		organization: "쌍용강북교육센터",
		skills: [
			"Java",
			"Spring Boot",
			"MyBatis / JPA",
			"Oracle / MySQL",
			"Docker",
			"Jenkins",
			"AWS",
		],
		achievements: [
			"MVC 패턴과 계층 분리를 적용한 웹 애플리케이션 개발",
			"Docker · Jenkins · GitHub Actions 기반 CI/CD 구성",
			"팀 프로젝트 2회와 개인 프로젝트 1회 수행",
		],
		icon: "material-symbols:school",
		color: "#2563EB",
		featured: true,
	},
	{
		id: "sqld",
		title: "SQLD 취득",
		description: "SQL 개발자 자격을 취득하며 관계형 데이터베이스 이해를 정리했습니다.",
		type: "achievement",
		startDate: "2025-09-19",
		endDate: "2025-09-19",
		organization: "한국데이터산업진흥원",
		icon: "material-symbols:database",
		color: "#EA580C",
	},
	{
		id: "graduation",
		title: "국립금오공과대학교 컴퓨터소프트웨어공학과 졸업",
		description: "컴퓨터소프트웨어공학을 전공하고 졸업했습니다.",
		type: "education",
		startDate: "2017-02-01",
		endDate: "2024-02-01",
		location: "경상북도 구미",
		organization: "국립금오공과대학교",
		achievements: ["학점 3.76 / 4.5"],
		icon: "material-symbols:school",
		color: "#2563EB",
	},
	{
		id: "coders-it-contest",
		title: "코더스아이티 제1회 프로그래밍 대회 수상",
		description: "프로그래밍 대회에 참가해 수상했습니다.",
		type: "achievement",
		startDate: "2023-09-12",
		endDate: "2023-09-12",
		location: "구미",
		icon: "material-symbols:emoji-events",
		color: "#7C3AED",
	},
	{
		id: "engineer-information-processing",
		title: "정보처리기사 취득",
		description: "소프트웨어 개발 전반의 기초 지식을 정리하며 자격을 취득했습니다.",
		type: "achievement",
		startDate: "2023-11-15",
		endDate: "2023-11-15",
		organization: "한국산업인력공단",
		icon: "material-symbols:verified",
		color: "#059669",
	},
];

// Get timeline statistics
export const getTimelineStats = () => {
	const total = timelineData.length;
	const byType = {
		education: timelineData.filter((item) => item.type === "education")
			.length,
		work: timelineData.filter((item) => item.type === "work").length,
		project: timelineData.filter((item) => item.type === "project").length,
		achievement: timelineData.filter((item) => item.type === "achievement")
			.length,
	};

	return { total, byType };
};

// Get timeline items by type
export const getTimelineByType = (type?: string) => {
	if (!type || type === "all") {
		return timelineData.sort(
			(a, b) =>
				new Date(b.startDate).getTime() -
				new Date(a.startDate).getTime(),
		);
	}
	return timelineData
		.filter((item) => item.type === type)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() -
				new Date(a.startDate).getTime(),
		);
};

// Get featured timeline items
export const getFeaturedTimeline = () => {
	return timelineData
		.filter((item) => item.featured)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() -
				new Date(a.startDate).getTime(),
		);
};

// Get current ongoing items
export const getCurrentItems = () => {
	return timelineData.filter((item) => !item.endDate);
};

// Calculate total work experience
export const getTotalWorkExperience = () => {
	const workItems = timelineData.filter((item) => item.type === "work");
	let totalMonths = 0;

	workItems.forEach((item) => {
		const startDate = new Date(item.startDate);
		const endDate = item.endDate ? new Date(item.endDate) : new Date();
		const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
		const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
		totalMonths += diffMonths;
	});

	return {
		years: Math.floor(totalMonths / 12),
		months: totalMonths % 12,
	};
};
