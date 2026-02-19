--
-- PostgreSQL database dump
--

\restrict mZPJPM5hjP8gBPIkLThALY7xoa6UaFoTQcl04TRc515V8TPzgLDydSPoGqFlxsc

-- Dumped from database version 16.12
-- Dumped by pg_dump version 16.12

-- Started on 2026-02-19 21:24:25

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 852 (class 1247 OID 16548)
-- Name: submission_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.submission_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.submission_status OWNER TO postgres;

--
-- TOC entry 849 (class 1247 OID 16538)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'CEO',
    'HR',
    'TEAM_LEAD',
    'INTERN'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 16727)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    type character varying(50),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16726)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 223
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 218 (class 1259 OID 16571)
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    intern_id integer NOT NULL,
    team_lead_id integer NOT NULL,
    deadline date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    start_date date,
    status character varying(20) DEFAULT 'Ongoing'::character varying
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16570)
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO postgres;

--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 217
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- TOC entry 222 (class 1259 OID 16667)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    intern_id integer,
    team_lead_id integer,
    attendance integer,
    tasks_completed integer,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16666)
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO postgres;

--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 221
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- TOC entry 220 (class 1259 OID 16618)
-- Name: submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submissions (
    id integer NOT NULL,
    intern_id integer NOT NULL,
    project_id integer NOT NULL,
    title character varying(200),
    description text,
    pdf_url text,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    feedback text,
    serial_no integer,
    additional_docs text,
    reviewed_at timestamp without time zone,
    is_late boolean DEFAULT false
);


ALTER TABLE public.submissions OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16617)
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.submissions_id_seq OWNER TO postgres;

--
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 219
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- TOC entry 216 (class 1259 OID 16556)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    role public.user_role NOT NULL,
    team_lead_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16555)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4964 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4772 (class 2604 OID 16730)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4763 (class 2604 OID 16574)
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- TOC entry 4770 (class 2604 OID 16670)
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- TOC entry 4766 (class 2604 OID 16621)
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- TOC entry 4761 (class 2604 OID 16559)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4954 (class 0 OID 16727)
-- Dependencies: 224
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, message, type, is_read, created_at) FROM stdin;
1	23	New project assigned: Test Notification Project	PROJECT_ASSIGNED	f	2026-02-18 17:51:24.92075
2	\N	New submission uploaded by undefined	SUBMISSION_UPLOADED	f	2026-02-18 17:54:52.457396
3	28	New project assigned: AI Chatbot System	PROJECT_ASSIGNED	f	2026-02-18 19:52:00.409793
4	\N	New submission uploaded by undefined	SUBMISSION_UPLOADED	f	2026-02-18 19:57:36.81194
5	\N	New submission uploaded by undefined	SUBMISSION_UPLOADED	f	2026-02-19 14:53:21.820711
6	17	New submission uploaded by undefined	SUBMISSION_UPLOADED	f	2026-02-19 15:11:21.223274
7	17	New submission uploaded by Mohan	SUBMISSION_UPLOADED	f	2026-02-19 15:31:25.408284
8	23	Your submission has been Approved	FEEDBACK	f	2026-02-19 15:34:38.110671
9	23	Reminder: Your project "Test Notification Project" is due tomorrow.	DEADLINE_REMINDER	f	2026-02-19 15:55:00.086918
10	17	New submission uploaded by Mohan	SUBMISSION_UPLOADED	f	2026-02-19 17:16:38.70967
\.


--
-- TOC entry 4948 (class 0 OID 16571)
-- Dependencies: 218
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, title, description, intern_id, team_lead_id, deadline, created_at, start_date, status) FROM stdin;
8	Database Schema	Build DB Schema	25	17	2026-02-17	2026-02-17 23:26:05.264274	2026-02-17	Ongoing
10	AI Chatbot System	Intern project for building chatbot	28	17	2026-03-30	2026-02-18 19:52:00.384185	2026-02-18	Ongoing
9	Test Notification Project	Testing notification	23	17	2026-02-20	2026-02-18 17:51:24.895835	2026-02-18	Ongoing
\.


--
-- TOC entry 4952 (class 0 OID 16667)
-- Dependencies: 222
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, intern_id, team_lead_id, attendance, tasks_completed, remarks, created_at) FROM stdin;
\.


--
-- TOC entry 4950 (class 0 OID 16618)
-- Dependencies: 220
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.submissions (id, intern_id, project_id, title, description, pdf_url, submitted_at, status, feedback, serial_no, additional_docs, reviewed_at, is_late) FROM stdin;
8	25	8	Week 1 Work	Completed  DB Schemas	work.pdf	2026-02-17 23:32:57.269041	Approved	Good work	1	\N	2026-02-17 23:36:03.890071	f
11	23	8	Week ! Report	\N	1771409719865-409991776.pdf	2026-02-18 15:45:20.004916	Pending	\N	2	[]	\N	f
12	23	8	Week ! Report	\N	1771412768920-223657690.pdf	2026-02-18 16:36:09.178533	Pending	\N	3	[]	\N	t
13	23	9	Week ! Report	\N	1771417492275-10887143.pdf	2026-02-18 17:54:52.44447	Pending	\N	1	[]	\N	f
14	23	9	Week ! Report	\N	1771424856697-837170541.pdf	2026-02-18 19:57:36.805641	Pending	\N	2	[]	\N	f
15	23	9	donno	\N	1771493001648-964411823.pdf	2026-02-19 14:53:21.794534	Pending	\N	3	[]	\N	f
16	23	9	donno	\N	1771494081049-708619585.pdf	2026-02-19 15:11:21.203422	Pending	\N	4	[]	\N	f
17	23	9	donno	\N	1771495285362-122203732.pdf	2026-02-19 15:31:25.389452	Approved	Good work	5	[]	\N	f
18	23	9	donno	\N	1771501598593-43808361.pdf	2026-02-19 17:16:38.692972	Pending	\N	6	[]	\N	f
\.


--
-- TOC entry 4946 (class 0 OID 16556)
-- Dependencies: 216
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, role, team_lead_id, created_at, password) FROM stdin;
16	Sai Ram	sairam@company.com	TEAM_LEAD	\N	2026-02-16 21:23:52.219829	$2b$10$PELX.kw3BsqLNXRyzHNqRucdieD70we3/qO9AEqPZlhQKbmelUjZO
17	Vasanth	vasanth@company.com	TEAM_LEAD	\N	2026-02-16 21:23:52.344074	$2b$10$AP8ekr9e9KtVDWH884.fFegETuUId/e/4KW6WwEZ65vz1qdvIAkYm
18	Sathya Pranav	sathya@company.com	TEAM_LEAD	\N	2026-02-16 21:23:52.480444	$2b$10$c64ud6kK3BeJ/Oc/6/CJBus/MtWUgatAhUUIl5Nz.Oq0omrW2ocCm
19	Saritha	saritha@company.com	HR	\N	2026-02-16 21:37:32.148753	$2b$10$P6uMMULDpoJooPBjtAEdbOXY/3OQDL6jWtOELUJbH/.SZbcRq4IRq
26	Test Intern	testintern@company.com	INTERN	\N	2026-02-17 16:08:26.405773	$2b$10$hcvh4GdogrV2pSbh6So12O1K2XQV.vqD2f/d8qdGOYN01EpBkNSCK
25	Sanjana	sanjana@company.com	INTERN	17	2026-02-16 21:39:41.399757	$2b$10$Hgil1Z9uncLZt187idAd3OWWrjXaWsM4xM9hs.ZbZUYr86kSoXi9W
23	Mohan	mohan@company.com	INTERN	17	2026-02-16 21:39:41.104687	$2b$10$2hVSDf8HRpEv7Ly7JDYbc.nViMohq8qSIj/3WOlN8hUvHfidtYGki
24	Akif	akif@company.com	INTERN	16	2026-02-16 21:39:41.238065	$2b$10$ugWszKnuV8mbOQJWa7UpYOBg6NAUfAtnZpf5Ml3RYY0CmTegEjxhS
21	Tejeshwar	tejeshwar@company.com	INTERN	16	2026-02-16 21:39:40.850843	$2b$10$VRzZAnrMb5G7gGQ48/HrXOIRjhXIx4POrPwPE0xZaWxR6lLbQ2eU.
15	Akhil	akhil@company.com	CEO	\N	2026-02-16 21:13:33.323511	$2b$10$3it4KqzcjFb65WsZEr.eS.JKf0dbV/kT6aowtt4mx4glFmJ6dXEdC
20	Naveen	naveen@company.com	INTERN	18	2026-02-16 21:39:40.718372	$2b$10$o0y0kbbhDuHwpQtcYv.OnOgXhV3N30ptOGgAhcymWA.wvZbw7.WXq
22	Sravika	sravika@company.com	INTERN	18	2026-02-16 21:39:40.981241	$2b$10$fbzUocg9ksDBEm1tinhO6uNXn8uJApK2KgiMZsmRZRbb2Ejz.mQs2
28	OLD Intern	oldintern@company.com	INTERN	\N	2026-02-17 23:46:26.473506	$2b$10$YNvtjubzpa.ygcWsSCE72O5os6Rtjk.DH8J05OaRKo8n9xvIKbaqe
27	New Intern	newintern@company.com	INTERN	18	2026-02-17 16:57:56.221462	$2b$10$YJFg1IHo7NZ0uCxuuqT2IOky5ov1AihkdyBDVlbJfNTVr86Ecqs/e
\.


--
-- TOC entry 4965 (class 0 OID 0)
-- Dependencies: 223
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 10, true);


--
-- TOC entry 4966 (class 0 OID 0)
-- Dependencies: 217
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 10, true);


--
-- TOC entry 4967 (class 0 OID 0)
-- Dependencies: 221
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_id_seq', 1, false);


--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 219
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.submissions_id_seq', 18, true);


--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 28, true);


--
-- TOC entry 4793 (class 2606 OID 16736)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4784 (class 2606 OID 16579)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4790 (class 2606 OID 16675)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4786 (class 2606 OID 16627)
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 4788 (class 2606 OID 16745)
-- Name: submissions unique_project_serial; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT unique_project_serial UNIQUE (project_id, serial_no);


--
-- TOC entry 4777 (class 2606 OID 16564)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4779 (class 2606 OID 16562)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4791 (class 1259 OID 16743)
-- Name: idx_notifications_user_type_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_type_date ON public.notifications USING btree (user_id, type, created_at);


--
-- TOC entry 4780 (class 1259 OID 16742)
-- Name: idx_projects_deadline; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_deadline ON public.projects USING btree (deadline);


--
-- TOC entry 4781 (class 1259 OID 16612)
-- Name: idx_projects_intern; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_intern ON public.projects USING btree (intern_id);


--
-- TOC entry 4782 (class 1259 OID 16613)
-- Name: idx_projects_teamlead; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_teamlead ON public.projects USING btree (team_lead_id);


--
-- TOC entry 4775 (class 1259 OID 16611)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 4801 (class 2606 OID 16737)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4795 (class 2606 OID 16580)
-- Name: projects projects_intern_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4796 (class 2606 OID 16585)
-- Name: projects projects_team_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_team_lead_id_fkey FOREIGN KEY (team_lead_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4799 (class 2606 OID 16676)
-- Name: reports reports_intern_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.users(id);


--
-- TOC entry 4800 (class 2606 OID 16681)
-- Name: reports reports_team_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_team_lead_id_fkey FOREIGN KEY (team_lead_id) REFERENCES public.users(id);


--
-- TOC entry 4797 (class 2606 OID 16628)
-- Name: submissions submissions_intern_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.users(id);


--
-- TOC entry 4798 (class 2606 OID 16720)
-- Name: submissions submissions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 4794 (class 2606 OID 16565)
-- Name: users users_team_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_team_lead_id_fkey FOREIGN KEY (team_lead_id) REFERENCES public.users(id) ON DELETE SET NULL;


-- Completed on 2026-02-19 21:24:26

--
-- PostgreSQL database dump complete
--

\unrestrict mZPJPM5hjP8gBPIkLThALY7xoa6UaFoTQcl04TRc515V8TPzgLDydSPoGqFlxsc

