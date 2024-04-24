@extends('layouts.app')

@section('content')
    <div class="container">
        <h1 class="d-inline-flex justify-content-between w-100">
            <div><span class="orange-text"><i class="fa fa-pencil"></i> SKAB CONTENT</span> - INDHOLDSLIST</div>
            <a href="{{route('image-editor.show', [])}}" class="d-block btn btn btn-warning">SKAB NYT CONTENT</a>
        </h1>
        <table class="table table-striped table-hover table-theme">
            <thead>
            <tr>
                <td>PREVIEW</td>
                <td>FILNAVN</td>
                <td>DATO</td>
                <td></td>
            </tr>
            </thead>
            <tbody>
            @foreach ($imageResources as $imageResource)
                <tr>
                    <td>
                        <img class="image-editor-preview" src="{{$imageResource->image}}">
                    </td>
                    <td>
                        {{ $imageResource->name }}
                    </td>
                    <td>
                        {{ $imageResource->created_at }}
                    </td>
                    <td class="text-right">
                        <a class="btn btn-outline-warning" onclick='openMe("{{ $imageResource->image }}"); return false;'>
                            <i class="fa fa-eye"></i>VIS</a>
                        <a class="btn btn-outline-warning" href="{{route('image-editor.show', ['id' => $imageResource->id])}}">
                            <i class="fa fa-pencil"></i>RET
                        </a>
                        <a class="btn btn-outline-warning" href="{{route('image-editor.delete', ['id' => $imageResource->id])}}" onclick="return confirm('Er du sikker på, du vil slette dette indhold?')">
                            <i class="fa fa-trash"></i>SLET
                        </a>
                    </td>
                </tr>
            @endforeach
            </tbody>
        </table>

    <script>
        /**
         * This is very bad! But need it to work for presentation!
         * @param data
         */
        function openMe(data) {
            var image = new Image();
            image.src = data;

            var w = window.open("");
            w.document.write(image.outerHTML);
        }
    </script>
@endsection

