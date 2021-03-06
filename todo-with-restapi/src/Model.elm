module Model exposing (..)

import RemoteData exposing (WebData)
import Json.Decode as Decode
import Json.Decode.Pipeline as P
import Json.Encode as Encode


-- MODEL


type alias Todo =
    { id : Int
    , value : String
    , done : Bool
    }


type alias Model =
    { newtodo : String
    , todos : WebData (List Todo)
    }


initialModel : Model
initialModel =
    { newtodo = ""
    , todos = RemoteData.NotAsked
    }



-- DECODERS


todosDecoder : Decode.Decoder (List Todo)
todosDecoder =
    Decode.list todoDecoder


todoDecoder : Decode.Decoder Todo
todoDecoder =
    P.decode Todo
        |> P.required "id" Decode.int
        |> P.required "value" Decode.string
        |> P.required "done" Decode.bool



-- ENCODERS


todoEncoder : Todo -> Encode.Value
todoEncoder todo =
    let
        attributes =
            [ ( "id", Encode.int todo.id )
            , ( "value", Encode.string todo.value )
            , ( "done", Encode.bool todo.done )
            ]
    in
        Encode.object attributes


idEncoder : Int -> Encode.Value
idEncoder todoId =
    Encode.object [ ( "id", Encode.int todoId ) ]
