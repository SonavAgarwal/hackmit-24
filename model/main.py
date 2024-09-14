import modal
from fastapi import Request


app = modal.App("example-get-started")
vol = modal.Volume.from_name("data")

# @app.function(volumes={"/my_vol": modal.Volume.from_name("data")})                                                      
# def some_func():                                                                                                        
#     os.listdir("/my_vol")                                                                                               

@app.function(volumes={"/data": vol})
def square(x):
    import os
    print("This code is running on a remote worker!")
    files = os.listdir("/data")
    print("Files in /data:", files)
    return x**2

@app.function(volumes={"/data": vol}, image=modal.Image.debian_slim().pip_install("keras==2.12.0", "tensorflow==2.12.0"))
def create_model():
    import keras
    from keras import layers
    import tensorflow as tf
    from keras import applications, models, layers

    import os
    print(os.listdir('/data'))


    train_dataset = keras.utils.image_dataset_from_directory(
        '/data',                       
        labels='inferred',             
        label_mode='int',              
        batch_size=32,                 
        image_size=(256, 256),         
        shuffle=True,                  
        validation_split=0.5,          
        subset='training',             
        seed=123                       
    )

    validation_dataset = keras.utils.image_dataset_from_directory(
        '/data',                    
        labels='inferred',           
        label_mode='int',            
        batch_size=32,               
        image_size=(256, 256),       
        shuffle=True,                
        validation_split=0.2,        
        subset='validation',         
        seed=123                     
    )

    # normalize pixel values to [0, 1]
    normalization_layer = layers.Rescaling(1./255)

    train_dataset = train_dataset.map(lambda x, y: (normalization_layer(x), y))
    validation_dataset = validation_dataset.map(lambda x, y: (normalization_layer(x), y))

    # Prefetch to optimize performance during training
    # AUTOTUNE = tf.data.AUTOTUNE
    # train_dataset = train_dataset.prefetch(buffer_size=AUTOTUNE)
    # validation_dataset = validation_dataset.prefetch(buffer_size=AUTOTUNE)

    base_model = applications.MobileNetV2(input_shape=(256, 256, 3), include_top=False, weights='imagenet')
    base_model.trainable = False  

    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(128, activation='relu'),
        layers.Dense(1, activation='sigmoid')  # Assuming binary classification (fire risk vs no fire risk)
    ])

    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                loss='binary_crossentropy',
                metrics=['accuracy'])

    # training
    history = model.fit(
        train_dataset,
        validation_data=validation_dataset,
        epochs=10
    )

    # unfreeze base model layers and fine tune
    base_model.trainable = True
    for layer in base_model.layers[:-40]:
        layer.trainable = False

    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
                loss='binary_crossentropy',
                metrics=['accuracy'])

    fine_tune_history = model.fit(
        train_dataset,
        validation_data=validation_dataset,
        epochs=5
    )

    model.save('/data/fire_risk_model.h5')


@app.function(volumes={"/data": vol}, image=modal.Image.debian_slim().pip_install("keras==2.12.0", "tensorflow==2.12.0"))
@modal.web_endpoint(method="POST")
async def classify_image(request: Request):
    try: 
        form = await request.form()
        print(form)  # Print the form data to see if the file is included
        image_file = form.get("file")
        print(image_file)  # Check if image_file is correctly assigned

        return {"image": image_file.filename}
    except Exception as e:
        return {"error": str(e)}



@app.local_entrypoint()
def main():
    create_model.remote()
    print("the square is", square.remote(42))

