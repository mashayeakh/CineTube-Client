export default async function MovieDetails({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;


    console.log({id})

    return (
        <div>
            Movie ID: {id}
        </div>
    );
}