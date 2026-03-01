import { cookies } from "next/headers";
import { ResumeBuilder } from "~/components/ResumeBuilder";
import type { Layout } from "react-resizable-panels";

export default async function HomePage() {
	const cookieStore = await cookies();
	const layoutCookie = cookieStore.get("react-resizable-panels:layout");
	const defaultLayout = layoutCookie
		? (JSON.parse(layoutCookie.value) as Layout)
		: undefined;

	return <ResumeBuilder defaultLayout={defaultLayout} />;
}
