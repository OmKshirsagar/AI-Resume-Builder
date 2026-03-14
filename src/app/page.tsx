import { cookies } from "next/headers";
import type { Layout } from "react-resizable-panels";
import { ResumeBuilder } from "~/components/ResumeBuilder";

export default async function HomePage() {
	const cookieStore = await cookies();
	const layoutCookie = cookieStore.get("react-resizable-panels:layout");
	const defaultLayout = layoutCookie
		? (JSON.parse(layoutCookie.value) as Layout)
		: undefined;

	return <ResumeBuilder defaultLayout={defaultLayout} />;
}
